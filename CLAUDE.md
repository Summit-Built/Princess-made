# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (Vite HMR + tsx watch server, auto-finds open port from 3000)
npm run dev

# Production build (Vite client → dist/public/, esbuild server → dist/index.js)
npm run build

# Run production server
npm start

# Type check
npm run check

# Format code
npm run format

# Run tests (vitest, covers server/**/*.test.ts)
npm run test

# Database migrations (generate + apply)
npm run db:push
```

Package manager is **pnpm**.

## Architecture

Full-stack TypeScript e-commerce app: React 19 frontend + Express/tRPC backend + SQLite (Drizzle ORM).

### Client (`client/`)
- **Vite** build with React 19, **Wouter** for routing, **TailwindCSS 4** for styling
- **Zustand** store for cart (persisted to localStorage), React Context for theme
- **TanStack React Query** + **tRPC client** for all API calls (type-safe end-to-end)
- Pages are lazy-loaded for code splitting. UI components wrap Radix UI primitives.
- Framer Motion for animations, React Hook Form + Zod for form validation

### Server (`server/`)
- Express app with tRPC handler at `/api/trpc`
- Three auth levels via tRPC middleware: `publicProcedure`, `protectedProcedure`, `adminProcedure`
- Auth routes (`POST /api/auth/login`, `/api/auth/register`) are plain Express, not tRPC
- Stripe webhook at `POST /api/webhooks/stripe` handles checkout completion, payment failure, refunds
- JWT sessions stored in HTTP-only cookie (`app_session_id`)

### Shared (`shared/`)
- Constants and types shared between client and server

### Database (`drizzle/`)
- SQLite with Drizzle ORM, WAL mode. DB file at `data/princess-made.db` (or `$DATABASE_DIR`)
- Schema in `drizzle/schema.ts`: users, products, orders, orderItems, addresses, favorites, newsletter_subscribers, contact_messages, password_reset_tokens
- Auto-migrates on server startup

### Key patterns
- Products are synced from Stripe (Stripe is source of truth for product/price data), with a 5-minute in-memory cache
- Admin role is assigned by matching user email against `ADMIN_EMAIL` env var
- Contact form uses honeypot field for spam prevention

## Environment Variables

Required in `.env`:
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `JWT_SECRET`
- `ADMIN_EMAIL` (email address that gets admin role)
- `RESEND_API_KEY` (transactional email via Resend)
- Optional: `PORT` (default 3000), `DATABASE_DIR`, `NODE_ENV`
