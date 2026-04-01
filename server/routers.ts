import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import * as stripe from "./stripe";
import * as email from "./email";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

function auspostTrackingUrl(trackingNumber: string) {
  return `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(trackingNumber)}`;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async (opts) => {
      const user = opts.ctx.user;
      if (user && ENV.adminEmails.includes(user.email.toLowerCase()) && user.role !== 'admin') {
        await db.updateUserRole(user.id, 'admin');
        user.role = 'admin';
      }
      return user;
    }),
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
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByEmail(input.email);
        if (user) {
          const token = nanoid(32);
          await db.createPasswordResetToken(user.id, token);
          const origin = `${ctx.req.protocol}://${ctx.req.get("host")}`;
          const resetLink = `${origin}/reset-password?token=${token}`;
          await email.sendPasswordResetEmail({
            to: input.email,
            resetLink,
          });
        }
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
    // Guest checkout - no auth required
    createGuestSession: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          stripePriceId: z.string(),
          stripeProductId: z.string(),
          quantity: z.number().min(1),
          price: z.number(),
          name: z.string(),
        })),
        email: z.string().email(),
        name: z.string().min(1),
        shippingAddress: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify prices server-side from Stripe (don't trust client prices)
        const allProducts = await stripe.getProducts();
        const verifiedItems = input.items.map(item => {
          const product = allProducts.find(p => p.stripeProductId === item.stripeProductId);
          if (!product) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Product not found: ${item.stripeProductId}` });
          }
          if (!item.stripePriceId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Missing price ID for: ${item.name}` });
          }
          return { ...item, price: product.price }; // Use server-verified price
        });
        const totalAmount = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const origin = `${ctx.req.protocol}://${ctx.req.get("host")}`;
        const session = await stripe.createCheckoutSession({
          lineItems: verifiedItems.map(item => ({
            stripePriceId: item.stripePriceId,
            quantity: item.quantity,
          })),
          customerEmail: input.email,
          userId: 0, // guest
          successUrl: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/checkout`,
        });

        // Create pending order (guest - no userId)
        const order = await db.createOrder({
          userId: null,
          guestEmail: input.email,
          guestName: input.name,
          stripeSessionId: session.sessionId,
          totalAmount,
          status: "pending",
        });

        // Create order items
        if (order) {
          for (const item of verifiedItems) {
            await db.createOrderItem({
              orderId: order.id,
              productId: item.stripeProductId,
              stripeProductId: item.stripeProductId,
              quantity: item.quantity,
              priceAtTime: item.price,
            });
          }

          // Send order confirmation email
          email.sendOrderConfirmation({
            to: input.email,
            orderNumber: `PM-${1000 + order.id}`,
            totalAmount,
            items: verifiedItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price * i.quantity })),
            guestTrackingUrl: `${origin}/track-order?email=${encodeURIComponent(input.email)}`,
          }).catch(err => console.error("Failed to send order confirmation email:", err));
        }

        return { url: session.url, sessionId: session.sessionId };
      }),

    // Authenticated checkout
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
        // Verify prices server-side from Stripe (don't trust client prices)
        const allProducts = await stripe.getProducts();
        const verifiedItems = input.items.map(item => {
          const product = allProducts.find(p => p.stripeProductId === item.stripeProductId);
          if (!product) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Product not found: ${item.stripeProductId}` });
          }
          if (!item.stripePriceId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Missing price ID for: ${item.name}` });
          }
          return { ...item, price: product.price };
        });
        const totalAmount = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
          lineItems: verifiedItems.map(item => ({
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

        // Create order items + send email
        if (order) {
          for (const item of verifiedItems) {
            await db.createOrderItem({
              orderId: order.id,
              productId: item.stripeProductId,
              stripeProductId: item.stripeProductId,
              quantity: item.quantity,
              priceAtTime: item.price,
            });
          }

          email.sendOrderConfirmation({
            to: ctx.user.email,
            orderNumber: `PM-${1000 + order.id}`,
            totalAmount,
            items: verifiedItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price * i.quantity })),
          }).catch(err => console.error("Failed to send order confirmation email:", err));
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
    cancel: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const order = await db.getOrderById(input);
        const result = await db.cancelPendingOrder(input, ctx.user.id);
        if (!result) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Order cannot be cancelled" });
        }
        // Send cancellation confirmation email
        if (order) {
          const customerEmail = order.guestEmail || ctx.user.email;
          email.sendOrderCancellation({
            to: customerEmail,
            orderNumber: `PM-${1000 + order.id}`,
            totalAmount: order.totalAmount,
          }).catch(err => console.error("Failed to send cancellation email:", err));
        }
        return result;
      }),
    // Generate invoice data for an order
    invoice: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const items = await db.getOrderItems(input);
        const products = await stripe.getProducts();
        return {
          orderNumber: `PM-${1000 + order.id}`,
          date: order.createdAt,
          status: order.status,
          totalAmount: order.totalAmount,
          items: items.map(item => {
            const product = products.find(p => p.stripeProductId === item.productId);
            return {
              name: product?.name || item.productId,
              quantity: item.quantity,
              unitPrice: item.priceAtTime,
              total: item.priceAtTime * item.quantity,
            };
          }),
        };
      }),
    // Guest order lookup by email
    lookupByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const orders = await db.getOrdersByGuestEmail(input.email);
        // Return limited info for guest orders
        return orders.map(o => ({
          id: o.id,
          orderNumber: `PM-${1000 + o.id}`,
          totalAmount: o.totalAmount,
          status: o.status,
          trackingNumber: o.trackingNumber,
          shippingStatus: o.shippingStatus,
          trackingUrl: o.trackingNumber ? auspostTrackingUrl(o.trackingNumber) : null,
          createdAt: o.createdAt,
        }));
      }),
    // Get items for a guest order (verified by email)
    guestGetItems: publicProcedure
      .input(z.object({ orderId: z.number(), email: z.string().email() }))
      .query(async ({ input }) => {
        const order = await db.getOrderByIdAndEmail(input.orderId, input.email);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        return db.getOrderItems(input.orderId);
      }),
    // Get order by session ID (for order confirmation page - works for both guest and auth)
    getBySessionId: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const order = await db.getOrderBySessionId(input);
        if (!order) return null;

        // Fetch order items
        const items = await db.getOrderItems(order.id);

        // Fetch shipping address if available
        let shippingAddress = null;
        if (order.shippingAddressId) {
          shippingAddress = await db.getAddressById(order.shippingAddressId);
        }

        return {
          id: order.id,
          orderNumber: `PM-${1000 + order.id}`,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          guestEmail: order.guestEmail,
          guestName: order.guestName,
          items: items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
          })),
          shippingAddress: shippingAddress ? {
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
          } : null,
        };
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

  contact: router({
    send: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(1, "Message is required").max(5000, "Message is too long"),
        website: z.string().optional(), // honeypot field
      }))
      .mutation(async ({ input }) => {
        // Anti-spam honeypot: if 'website' field is filled, it's a bot
        if (input.website) {
          // Silently succeed to not tip off the bot
          return { success: true };
        }

        // Store in database
        await db.insertContactMessage({
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
        });

        // Send email notification
        await email.sendContactFormNotification({
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
        });

        return { success: true };
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const result = await db.addNewsletterSubscriber(input.email);
        // Send newsletter confirmation email (non-blocking)
        email.sendNewsletterConfirmation({ to: input.email })
          .catch(err => console.error("Failed to send newsletter confirmation:", err));
        return result;
      }),
  }),

  admin: router({
    orders: router({
      list: adminProcedure.query(async () => {
        const orders = await db.getAllOrders();
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
        .mutation(async ({ input }) => {
          const result = await db.updateOrderTracking(input.orderId, input.trackingNumber, input.shippingStatus);

          // Send shipping update email
          if (result) {
            const customerEmail = result.guestEmail || (result.userId ? (await db.getUserById(result.userId))?.email : null);
            if (customerEmail) {
              // Send delivery confirmation for "delivered" status, shipping update for everything else
              if (input.shippingStatus === "delivered") {
                email.sendDeliveryConfirmation({
                  to: customerEmail,
                  orderNumber: `PM-${1000 + result.id}`,
                }).catch(err => console.error("Failed to send delivery confirmation email:", err));
              } else {
                email.sendShippingUpdate({
                  to: customerEmail,
                  orderNumber: `PM-${1000 + result.id}`,
                  trackingNumber: input.trackingNumber,
                  shippingStatus: input.shippingStatus,
                  trackingUrl: auspostTrackingUrl(input.trackingNumber),
                }).catch(err => console.error("Failed to send shipping update email:", err));
              }
            }
          }

          return result;
        }),
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
      sendShippingEmail: adminProcedure
        .input(z.object({ orderId: z.number() }))
        .mutation(async ({ input }) => {
          const order = await db.getOrderById(input.orderId);
          if (!order) throw new TRPCError({ code: "NOT_FOUND" });
          if (!order.trackingNumber) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "No tracking number set for this order" });
          }
          const customerEmail = order.guestEmail || (order.userId ? (await db.getUserById(order.userId))?.email : null);
          if (!customerEmail) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "No customer email found" });
          }
          await email.sendShippingUpdate({
            to: customerEmail,
            orderNumber: `PM-${1000 + order.id}`,
            trackingNumber: order.trackingNumber,
            shippingStatus: order.shippingStatus || "shipped",
            trackingUrl: auspostTrackingUrl(order.trackingNumber),
          });
          return { success: true };
        }),
    }),
    users: router({
      list: adminProcedure.query(() => db.getAllUsersWithStats()),
      getOrders: adminProcedure
        .input(z.number())
        .query(({ input }) => db.getUserOrdersAdmin(input)),
    }),
    newsletter: router({
      list: adminProcedure.query(() => db.getAllNewsletterSubscribers()),
    }),
    stats: adminProcedure.query(() => db.getAdminStats()),
  }),
});

export type AppRouter = typeof appRouter;
