import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import * as stripe from "./stripe";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateUser(ctx.user.id, input);
      }),
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot change password" });
        }
        const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Current password is incorrect" });
        }
        const hash = await bcrypt.hash(input.newPassword, 10);
        await db.updateUserPassword(ctx.user.id, hash);
        return { success: true };
      }),
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        if (user) {
          const token = nanoid(32);
          await db.createPasswordResetToken(user.id, token);
          // In production, send email with reset link
          // For now, log it (the token is stored in DB)
          console.log(`Password reset token for ${input.email}: ${token}`);
        }
        // Always return success to prevent email enumeration
        return { success: true, message: "If an account exists with that email, a reset link has been sent." };
      }),
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const resetToken = await db.getPasswordResetToken(input.token);
        if (!resetToken || resetToken.used || new Date(resetToken.expiresAt) < new Date()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token" });
        }
        const hash = await bcrypt.hash(input.newPassword, 10);
        await db.updateUserPassword(resetToken.userId, hash);
        await db.markResetTokenUsed(input.token);
        return { success: true };
      }),
  }),

  products: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        let products = await stripe.getProducts();
        if (input?.category) {
          products = products.filter(p => p.category === input.category);
        }
        if (input?.search) {
          const searchLower = input.search.toLowerCase();
          products = products.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            p.category.toLowerCase().includes(searchLower)
          );
        }
        return products;
      }),
    getById: publicProcedure
      .input(z.string())
      .query(({ input }) => stripe.getProductById(input)),
  }),

  checkout: router({
    createSession: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          stripePriceId: z.string(),
          stripeProductId: z.string(),
          quantity: z.number().min(1),
          price: z.number(),
          name: z.string(),
        })),
        shippingAddress: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const totalAmount = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Save shipping address if provided
        let shippingAddressId: number | null = null;
        if (input.shippingAddress) {
          const address = await db.createAddress({
            userId: ctx.user.id,
            street: input.shippingAddress.street,
            city: input.shippingAddress.city,
            state: input.shippingAddress.state,
            postalCode: input.shippingAddress.postalCode,
            country: input.shippingAddress.country || "AU",
          });
          shippingAddressId = address.id;
        }

        const origin = `${ctx.req.protocol}://${ctx.req.get("host")}`;
        const session = await stripe.createCheckoutSession({
          lineItems: input.items.map(item => ({
            stripePriceId: item.stripePriceId,
            quantity: item.quantity,
          })),
          customerEmail: ctx.user.email,
          userId: ctx.user.id,
          successUrl: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/checkout`,
        });

        // Create pending order
        const order = await db.createOrder({
          userId: ctx.user.id,
          stripeSessionId: session.sessionId,
          totalAmount,
          status: "pending",
          shippingAddressId,
        });

        // Create order items
        if (order) {
          for (const item of input.items) {
            await db.createOrderItem({
              orderId: order.id,
              productId: item.stripeProductId,
              stripeProductId: item.stripeProductId,
              quantity: item.quantity,
              priceAtTime: item.price,
            });
          }
        }

        return { url: session.url, sessionId: session.sessionId };
      }),
  }),

  orders: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserOrders(ctx.user.id)),
    getById: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return order;
      }),
    getItems: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.getOrderItems(input);
      }),
  }),

  addresses: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserAddresses(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string().optional(),
        isDefault: z.number().optional(),
      }))
      .mutation(({ ctx, input }) =>
        db.createAddress({
          userId: ctx.user.id,
          street: input.street,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country || "AU",
          isDefault: input.isDefault || 0,
        })
      ),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        isDefault: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const address = await db.getAddressById(input.id);
        if (!address || address.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.updateAddress(input.id, {
          street: input.street,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          isDefault: input.isDefault,
        });
      }),
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const address = await db.getAddressById(input);
        if (!address || address.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.deleteAddress(input);
      }),
  }),

  favorites: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserFavorites(ctx.user.id)),
    isFavorited: protectedProcedure
      .input(z.string())
      .query(({ ctx, input }) => db.isFavorited(ctx.user.id, input)),
    add: protectedProcedure
      .input(z.string())
      .mutation(({ ctx, input }) => db.addFavorite(ctx.user.id, input)),
    remove: protectedProcedure
      .input(z.string())
      .mutation(({ ctx, input }) => db.removeFavorite(ctx.user.id, input)),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        return db.addNewsletterSubscriber(input.email);
      }),
  }),

  admin: router({
    orders: router({
      list: adminProcedure.query(async () => {
        const orders = await db.getAllOrders();
        // Attach user info to each order
        const ordersWithUsers = await Promise.all(
          orders.map(async (order) => {
            const enriched = await db.getOrderWithUser(order.id);
            return enriched || order;
          })
        );
        return ordersWithUsers;
      }),
      getItems: adminProcedure
        .input(z.number())
        .query(({ input }) => db.getOrderItems(input)),
      updateTracking: adminProcedure
        .input(z.object({
          orderId: z.number(),
          trackingNumber: z.string(),
          shippingStatus: z.string(),
        }))
        .mutation(({ input }) =>
          db.updateOrderTracking(input.orderId, input.trackingNumber, input.shippingStatus)
        ),
      updateStatus: adminProcedure
        .input(z.object({
          orderId: z.number(),
          status: z.string(),
        }))
        .mutation(async ({ input }) => {
          const order = await db.getOrderById(input.orderId);
          if (!order) throw new TRPCError({ code: "NOT_FOUND" });
          await db.updateOrderStatusById(input.orderId, input.status);
          return db.getOrderById(input.orderId);
        }),
    }),
    users: router({
      list: adminProcedure.query(() => db.getAllUsers()),
    }),
  }),
});

export type AppRouter = typeof appRouter;
