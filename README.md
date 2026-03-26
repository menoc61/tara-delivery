# 📦 TARA DELIVERY — Full-Stack Delivery Platform

> Production-ready delivery platform for Yaoundé, Cameroon  
> Built with Next.js, Node.js, PostgreSQL, Supabase, MTN MoMo & Orange Money

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│               TARA DELIVERY MONOREPO                    │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ Next.js  │  │  Expo    │  │   Node.js API        │   │
│  │ Web App  │  │  Mobile  │  │   (Express + TS)     │   │
│  │ :3000    │  │          │  │   :4000              │   │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘   │
│       │              │                  │               │
│  ┌────▼──────────────▼──────────────────▼────────────┐  │
│  │             Shared Packages                       │  │
│  │  @tara/types  @tara/zod-schemas  @tara/api-client │  │
│  └───────────────────────────────────────────────────┘  │
│                         │                               │
│         ┌───────────────┼────────────────┐              │
│         ▼               ▼                ▼              │
│    PostgreSQL       Supabase          SMTP Server       │
│    (Prisma ORM)   (Realtime DB +    (Nodemailer)        │
│                    Push Notifs)                         │
│         │                                               │
│    MTN MoMo & Orange Money APIs                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
tara-delivery/
├── apps/
│   ├── api/                    # Node.js + Express backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # JWT + Google OAuth
│   │   │   │   ├── users/      # Customer profiles
│   │   │   │   ├── orders/     # Order lifecycle
│   │   │   │   ├── riders/     # Rider management
│   │   │   │   ├── payments/   # MoMo + Orange Money
│   │   │   │   ├── notifications/ # Email + Push
│   │   │   │   └── admin/      # Dashboard + analytics
│   │   │   ├── middleware/     # Auth, errors, validation
│   │   │   ├── config/         # DB, Suberbase, JWT, logger
│   │   │   └── utils/          # Helpers
│   │   └── prisma/             # Schema + migrations + seed
│   ├── web/                    # Next.js 14 frontend
│   │   └── src/app/
│   │       ├── page.tsx        # Landing page
│   │       ├── auth/           # Login, register
│   │       ├── customer/       # Customer dashboard + orders
│   │       ├── rider/          # Rider dashboard
│   │       └── admin/          # Admin dashboard + analytics
│   └── mobile/                 # Expo React Native (scaffold)
├── packages/
│   ├── types/                  # Shared TypeScript interfaces
│   ├── zod-schemas/            # Validation schemas (shared)
│   ├── api-client/             # Typed API client
│   └── config/                 # Shared ESLint/TS configs
├── docker/
│   ├── api.Dockerfile
│   ├── web.Dockerfile
│   └── nginx.conf
├── .github/workflows/
│   └── ci-cd.yml               # GitHub Actions pipeline
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- PostgreSQL 16 (or Docker)
- Suberbase project

### 1. Clone and install

```bash
git clone https://github.com/menoc61/tara-delivary.git
cd tara-delivery
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in all required values (see .env.example)
```

### 3. Start with Docker (recommended)

```bash
# Start all services
docker compose up -d

# Run migrations + seed
docker compose exec api npx prisma migrate dev
docker compose exec api npx prisma db seed
```

### 4. Or start locally

```bash
# Start PostgreSQL (local)
# Then:
cd apps/api
npx prisma migrate dev
npx prisma db seed

# Start all apps from root
pnpm dev
```

**URLs:**

- 🌐 Web: http://localhost:3000
- ⚙️ API: http://localhost:4000
- 📊 Prisma Studio: `cd apps/api && npx prisma studio`

**Test credentials (after seed):**
| Role | Email | Password |
|----------|--------------------------|----------------|
| Admin | admin@tara-delivery.cm | Admin@123456 |
| Customer | customer@test.cm | Customer@123 |
| Rider | rider@test.cm | Rider@123 |

---

## 🔌 API Reference

### Authentication

| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| POST   | /api/auth/register        | Register new user     |
| POST   | /api/auth/login           | Email/password login  |
| GET    | /api/auth/google          | Google OAuth redirect |
| POST   | /api/auth/refresh         | Refresh access token  |
| POST   | /api/auth/forgot-password | Send reset email      |
| POST   | /api/auth/reset-password  | Reset with token      |
| GET    | /api/auth/me              | Current user profile  |

### Orders

| Method | Endpoint               | Description          | Auth        |
| ------ | ---------------------- | -------------------- | ----------- |
| POST   | /api/orders            | Create order         | Customer    |
| GET    | /api/orders/my         | My orders            | Customer    |
| GET    | /api/orders/available  | Available for riders | Rider       |
| GET    | /api/orders/:id        | Order details        | Owner       |
| PATCH  | /api/orders/:id/status | Update status        | Rider/Admin |
| POST   | /api/orders/:id/assign | Assign rider         | Admin       |
| POST   | /api/orders/:id/cancel | Cancel order         | Customer    |

### Payments

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| POST   | /api/payments/initiate         | Start payment        |
| GET    | /api/payments/order/:id        | Payment details      |
| GET    | /api/payments/order/:id/verify | Verify payment       |
| POST   | /api/webhooks/momo             | MTN MoMo webhook     |
| POST   | /api/webhooks/orange           | Orange Money webhook |

### Riders

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| POST   | /api/riders/register    | Become a rider        |
| GET    | /api/riders/me          | My rider profile      |
| PATCH  | /api/riders/me/status   | Set availability      |
| POST   | /api/riders/me/location | Update GPS location   |
| POST   | /api/riders/rate        | Rate a completed ride |

### Admin

| Method | Endpoint                     | Description        |
| ------ | ---------------------------- | ------------------ |
| GET    | /api/admin/dashboard         | Stats overview     |
| GET    | /api/admin/analytics/revenue | Revenue chart data |
| GET    | /api/admin/analytics/orders  | Orders by status   |
| GET    | /api/admin/users             | All users          |
| PATCH  | /api/admin/users/:id         | Update user        |
| PATCH  | /api/admin/riders/:id/verify | Verify rider       |

---

## 💳 Payment Integration

### MTN MoMo (Sandbox → Production)

1. Register at [developer.mtn.com](https://developer.mtn.com)
2. Create Collections API user
3. Set in `.env`: `MOMO_SUBSCRIPTION_KEY`, `MOMO_API_USER`, `MOMO_API_KEY`
4. Point `MOMO_CALLBACK_HOST` to your server webhook URL
5. Change `MOMO_ENVIRONMENT` from `sandbox` to `production`

### Orange Money

1. Register at [developer.orange.com](https://developer.orange.com)
2. Create app, get `CLIENT_ID` and `CLIENT_SECRET`
3. Configure `ORANGE_MERCHANT_KEY` and callback URLs
4. Currency: **XAF** (Central African Franc)

---

## 🔥 Suberbase Setup

1. Create Suberbase project at [console.Suberbase.google.com](https://console.Suberbase.google.com)
2. Enable **Realtime Database** and **Cloud Messaging**
3. Download service account JSON → extract values into `.env`
4. Set Realtime DB rules:

```json
{
  "rules": {
    "rider_locations": {
      ".read": "auth != null",
      "$riderId": {
        ".write": "auth.uid == $riderId"
      }
    },
    "order_updates": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## 🚀 Production Deployment (Hostinger VPS)

```bash
# 1. SSH into VPS
ssh user@your-vps-ip

# 2. Install Docker + Docker Compose
curl -fsSL https://get.docker.com | sh

# 3. Clone and configure
git clone https://github.com/your-org/tara-delivery.git /opt/tara-delivery
cd /opt/tara-delivery
cp .env.example .env
# Edit .env with production values

# 4. Setup SSL (Let's Encrypt)
apt install certbot
certbot certonly --standalone -d tara-delivery.cm
cp /etc/letsencrypt/live/tara-delivery.cm/fullchain.pem docker/certs/
cp /etc/letsencrypt/live/tara-delivery.cm/privkey.pem docker/certs/

# 5. Start services
docker compose up -d

# 6. Migrate and seed
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed

# 7. Verify
curl https://tara-delivery.cm/health
```

---

## ⚙️ GitHub Secrets for CI/CD

| Secret                | Description           |
| --------------------- | --------------------- |
| `VPS_HOST`            | VPS IP address        |
| `VPS_USER`            | SSH username          |
| `VPS_SSH_KEY`         | Private SSH key       |
| `VPS_PORT`            | SSH port (default 22) |
| `NEXT_PUBLIC_API_URL` | Production API URL    |

---

## 🧪 Running Tests

```bash
# All tests
pnpm test

# API tests only
cd apps/api && pnpm test

# With coverage
pnpm test -- --coverage
```

---

## 📱 Mobile App (Expo)

```bash
cd apps/mobile
npx expo start

# iOS simulator
npx expo run:ios

# Android emulator
npx expo run:android
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open Pull Request to `develop`

---

## 📄 License

MIT © 2026 Gilles Momeni / TARA DELIVERY

---

_Made with ❤️ in Yaoundé, Cameroun 🇨🇲_
