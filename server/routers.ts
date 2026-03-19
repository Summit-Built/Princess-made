import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import * as stripe from "./stripe";

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
  }),

  products: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const products = await stripe.getProducts();
        if (input?.category) {
          return products.filter(p => p.category === input.category);
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
      }))
      .mutation(async ({ ctx, input }) => {
        const totalAmount = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
          country: input.country || "US",
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
});

export type AppRouter = typeof appRouter;
