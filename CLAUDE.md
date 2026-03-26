# CLAUDE.md - AI Agent Project Context

This document provides AI agents with the context needed to understand, navigate, and contribute to the TARA DELIVERY codebase.

---

## Project Overview

**TARA DELIVERY** is a full-stack delivery platform built for Yaoundé, Cameroon. It connects customers who need items delivered with motorcycle riders (livreurs) who fulfill those deliveries. The platform supports real-time tracking, mobile money payments (MTN MoMo, Orange Money), and push notifications the entier monorepo should de deployed the web on vercel and the api on a hostinger vps 
VPS_SSH_KEY = (your private key)
VPS_HOST = 168.231.82.118
VPS_USER = root.

**Primary language:** French (UI/notifications/emails are in French)
**Currency:** XAF (Central African CFA franc)
**Coverage area:** Yaoundé and surrounding neighborhoods

---

## Architecture

```
tara-delivery/                  # Monorepo root (pnpm workspaces + Turborepo)
├── apps/
│   ├── api/                    # Express.js REST API (TypeScript)
│   ├── web/                    # Next.js 14 frontend (React 18)
│   └── mobile/                 # Expo React Native app (scaffolded, not yet implemented)
├── packages/
│   ├── types/                  # @tara/types — Shared TypeScript interfaces & enums
│   └── zod-schemas/            # @tara/zod-schemas — Shared Zod validation schemas
├── docker/                     # Dockerfiles for API, Web, Nginx
├── .github/workflows/          # CI/CD pipeline
├── docker-compose.yml          # Full stack Docker setup
└── turbo.json                  # Turborepo configuration
```

### Key Design Decisions

- **Monorepo with pnpm workspaces**: Shared types and validation schemas between API and frontend
- **Flat address fields in DB**: Instead of a separate Address table, pickup/delivery addresses are stored as flat columns on the Order model (`pickupStreet`, `pickupNeighborhood`, etc.) for query performance
- **Suberbase Realtime Database**: Used for live rider location tracking and order status updates
- **No ORM abstractions over Prisma**: Services call Prisma directly (no repository pattern)
- **JWT auth with refresh tokens**: Access tokens are short-lived (15m), refresh tokens last 7 days
- **Webhook-based payment confirmation**: MTN MoMo and Orange Money send payment status via webhooks

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Node.js 20+ | Required minimum version |
| Package Manager | pnpm 9+ | Uses workspaces |
| Build Orchestrator | Turborepo | Parallel builds & caching |
| API Framework | Express.js | With TypeScript |
| ORM | Prisma | PostgreSQL provider |
| Database | PostgreSQL 16 | Primary data store |
| Cache | Redis 7 | Session/rate-limit cache |
| Frontend | Next.js 14 | App Router, React 18 |
| Styling | Tailwind CSS | Custom design system (see DESIGN.md) |
| State Management | Zustand | Client-side state (auth, orders) |
| Forms | React Hook Form + Zod | With @hookform/resolvers |
| Charts | Recharts | Admin dashboard analytics |
| Real-time | Suberbase Realtime DB | Rider tracking, order updates |
| Push Notifications | Suberbase Cloud Messaging | Mobile & web push |
| Auth | Passport.js (Google), JWT | Dual auth strategy |
| Payments | MTN MoMo API, Orange Money API | Cameroonian mobile money |
| Email | Nodemailer | HTML email templates |
| Logging | Winston | File + console transports |
| Validation | Zod | Shared schemas in @tara/zod-schemas |
| Mobile | Expo React Native | Currently scaffolded only |

---

## API Structure

The API follows a modular architecture at `apps/api/src/`:

```
src/
├── index.ts                    # Express app entry point, middleware setup
├── config/
│   ├── database.ts             # Prisma singleton
│   ├── Suberbase.ts             # Suberbase Admin SDK setup
│   ├── jwt.ts                  # Token signing/verification
│   └── logger.ts               # Winston logger
├── middleware/
│   ├── auth.middleware.ts       # JWT authentication + role guards
│   ├── error.middleware.ts      # Global error handler + custom error classes
│   └── validate.middleware.ts   # Zod schema validation middleware
├── modules/
│   ├── auth/                   # Register, login, Google OAuth, password reset
│   ├── orders/                 # CRUD, status transitions, rider assignment
│   ├── payments/               # MTN MoMo, Orange Money, webhooks
│   ├── riders/                 # Registration, status, location, ratings
│   ├── notifications/          # Push notifications, email, FCM
│   ├── users/                  # Profile management, saved addresses
│   └── admin/                  # Dashboard stats, analytics, user management
└── utils/
    ├── delivery.utils.ts       # Fee calculation, distance (Haversine), ETA
    └── response.utils.ts       # Standardized API response helpers
```

### API Response Format

All endpoints return:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "VALIDATION_ERROR"
}
```

### Custom Error Classes

Located in `middleware/error.middleware.ts`:
- `AppError(message, statusCode)` - Base error class
- `NotFoundError(resource)` - 404
- `UnauthorizedError(message)` - 401
- `ForbiddenError(message)` - 403
- `ConflictError(message)` - 409

---

## Database Schema

The Prisma schema is at `apps/api/prisma/schema.prisma`.

### Core Models

| Model | Purpose |
|-------|---------|
| `User` | All users (customers, riders, admins). Role enum: CUSTOMER, RIDER, ADMIN |
| `Rider` | Extended rider profile (linked to User). Vehicle, location, status, rating |
| `Admin` | Extended admin profile (linked to User). Permissions array |
| `Order` | Delivery orders with flat pickup/delivery address fields |
| `OrderItem` | Items within an order (name, quantity, weight) |
| `DeliveryStatusLog` | Audit trail of order status changes |
| `Payment` | Payment record per order (method, status, external refs) |
| `Transaction` | Individual payment transactions (debit/credit/refund) |
| `Notification` | In-app notifications |
| `Rating` | Customer ratings for riders (1-5 scale) |
| `SavedAddress` | Customer saved delivery addresses |
| `PasswordReset` | Password reset tokens with expiry |

### Order Status Lifecycle

```
PENDING → CONFIRMED → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED
    ↓         ↓           ↓
 CANCELLED  CANCELLED   CANCELLED                          FAILED
```

Valid transitions are enforced in `order.service.ts`.

### Enums

Defined in both Prisma schema and `@tara/types`:
- `UserRole`: CUSTOMER, RIDER, ADMIN
- `OrderStatus`: PENDING, CONFIRMED, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED, FAILED
- `OrderType`: PARCEL, FOOD, COURIER, GROCERY
- `PaymentMethod`: MTN_MOMO, ORANGE_MONEY, CASH_ON_DELIVERY
- `PaymentStatus`: PENDING, INITIATED, SUCCESS, FAILED, REFUNDED
- `RiderStatus`: AVAILABLE, BUSY, OFFLINE
- `VehicleType`: MOTORCYCLE, BICYCLE, CAR, TRUCK

---

## Key Business Logic

### Delivery Fee Calculation (`utils/delivery.utils.ts`)

```
Base fee: 500 XAF
+ Distance fee: 150 XAF/km
+ Weight fee: 100 XAF/kg (above 2kg threshold)
+ Surcharges: COURIER +500, GROCERY +200
Clamped to: min 500 XAF, max 15,000 XAF
```

Distance is calculated using the Haversine formula from GPS coordinates.

### Phone Number Validation

Cameroonian format: `^(\+237|237)?[6-9][0-9]{8}$`
Normalized to `237XXXXXXXXX` format via Zod transform.

### Order Number Format

`TD` + `YYMMDD` + 4-digit random number (e.g., `TD2506153847`)

---

## Frontend Structure

The Next.js app at `apps/web/src/`:

```
src/
├── app/
│   ├── page.tsx                # Landing page (public)
│   ├── layout.tsx              # Root layout (fonts, toaster)
│   ├── globals.css             # Design system CSS
│   ├── auth/
│   │   ├── login/page.tsx      # Login form
│   │   └── register/page.tsx   # Registration form
│   ├── customer/
│   │   ├── page.tsx            # Customer dashboard
│   │   └── new-order/page.tsx  # Multi-step order creation
│   ├── rider/
│   │   └── page.tsx            # Rider dashboard (GPS, orders)
│   └── admin/
│       ├── layout.tsx          # Admin sidebar layout
│       └── page.tsx            # Admin dashboard (charts, stats)
├── store/
│   ├── auth.store.ts           # Zustand auth state (persisted to localStorage)
│   └── order.store.ts          # Zustand order state
└── lib/
    └── api-client.ts           # Axios instance with interceptors (auto-refresh)
```

### Auth Flow

1. User logs in via email/password or Google OAuth
2. API returns `{ user, tokens: { accessToken, refreshToken } }`
3. Tokens stored in Zustand (persisted to localStorage under key `tara-auth`)
4. Axios interceptor attaches `Authorization: Bearer <accessToken>` to all requests
5. On 401, interceptor auto-refreshes using the refresh token
6. On refresh failure, user is redirected to `/auth/login`

---

## Shared Packages

### @tara/types (`packages/types/`)

TypeScript interfaces and enums shared between API and frontend. Import as:
```typescript
import { User, Order, OrderStatus, UserRole } from "@tara/types";
```

### @tara/zod-schemas (`packages/zod-schemas/`)

Zod validation schemas used on both API (request validation) and frontend (form validation). Import as:
```typescript
import { createOrderSchema, CreateOrderInput } from "@tara/zod-schemas";
```

---

## Development Commands

```bash
pnpm dev          # Start all apps (API + Web) in dev mode
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm type-check   # TypeScript type-check across all packages
pnpm test         # Run test suite
pnpm format       # Format code with Prettier
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed database with test data
pnpm db:studio    # Open Prisma Studio (visual DB browser)
```

---

## Testing

### Test Credentials (from seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@tara-delivery.cm` | `Admin@123456` |
| Customer | `customer@test.cm` | `Customer@123` |
| Rider | `rider@test.cm` | `Rider@123` |

### API Endpoints

- Health check: `GET http://localhost:4000/health`
- Auth: `POST http://localhost:4000/api/auth/login`
- Orders: `GET http://localhost:4000/api/orders/my` (requires auth header)

---

## CI/CD Pipeline

Located at `.github/workflows/ci-cd.yml`:

1. **Quality** (on all PRs): pnpm install, type-check, lint
2. **Test** (after quality passes): PostgreSQL service container, Prisma migrations, test suite
3. **Build** (main/develop only): Docker images pushed to GitHub Container Registry
4. **Deploy** (main only): SSH to VPS, pull images, migrate, restart

---

## Common Patterns

### Adding a New API Endpoint

1. Define Zod schema in `packages/zod-schemas/src/index.ts`
2. Add TypeScript types in `packages/types/src/index.ts` (if needed)
3. Create/update service in `apps/api/src/modules/<module>/<module>.service.ts`
4. Create/update routes in `apps/api/src/modules/<module>/<module>.routes.ts`
5. Register routes in `apps/api/src/index.ts` if new module
6. Add API client method in `apps/web/src/lib/api-client.ts`

### Adding a New Frontend Page

1. Create page at `apps/web/src/app/<path>/page.tsx`
2. Use `"use client"` directive for interactive pages
3. Import API client methods from `@/lib/api-client`
4. Use Zustand stores for state management
5. Follow existing component patterns and CSS classes from `globals.css`

### Modifying the Database Schema

1. Edit `apps/api/prisma/schema.prisma`
2. Run `pnpm db:migrate` (creates migration file)
3. Run `pnpm db:generate` (regenerates Prisma client)
4. Update `@tara/types` if new types are needed
5. Update seed file if needed: `apps/api/prisma/seed.ts`

---

## Important Files Quick Reference

| File | Purpose |
|------|---------|
| `apps/api/prisma/schema.prisma` | Database schema (source of truth) |
| `apps/api/src/index.ts` | API entry point and middleware |
| `apps/api/src/middleware/auth.middleware.ts` | Authentication and role guards |
| `apps/api/src/middleware/error.middleware.ts` | Error handling and custom errors |
| `apps/api/src/utils/delivery.utils.ts` | Fee calculation and distance |
| `apps/web/src/lib/api-client.ts` | Frontend API client with auto-refresh |
| `apps/web/src/store/auth.store.ts` | Auth state management |
| `apps/web/src/app/globals.css` | Design system CSS classes |
| `packages/types/src/index.ts` | Shared TypeScript types |
| `packages/zod-schemas/src/index.ts` | Shared validation schemas |
| `.env.example` | All environment variables |
| `docker-compose.yml` | Full Docker stack |
