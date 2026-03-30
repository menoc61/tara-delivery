# 📦 TARA DELIVERY — Full-Stack Delivery Platform

> Production-ready delivery platform for Yaoundé, Cameroon  
> Built with Next.js 14, Node.js, PostgreSQL, Supabase, MTN MoMo & Orange Money

[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-black)](https://tara-delivery-web.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     TARA DELIVERY                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Next.js    │  │   Expo       │  │   Express    │       │
│  │   Web App    │  │   Mobile     │  │   API        │       │
│  │   :3000      │  │   (scaffold) │  │   :4000      │       │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘       │
│         │                                    │               │
│  ┌──────▼──────────────────────────────────▼───────┐        │
│  │              Shared Packages                    │        │
│  │  @tara/types  @tara/zod-schemas                 │        │
│  └─────────────────────────────────────────────────┘        │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐               │
│         ▼                 ▼                 ▼               │
│    PostgreSQL        Supabase          Redis                │
│    (Prisma)        (Realtime +       (Cache)                │
│                    Push Notifs)                              │
│                                                              │
│    MTN MoMo & Orange Money Payment APIs                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Customer App

- 📱 **PWA Support** - Installable on all devices
- 🔐 **Authentication** - Email/Password + Google OAuth
- 📦 **Order Management** - Create, track, and manage deliveries
- 🗺️ **Live Tracking** - Real-time map tracking with Leaflet
- 💬 **Chat** - In-app messaging with riders
- 💳 **Payments** - MTN MoMo, Orange Money, Cash
- 👤 **Profile** - Saved addresses, preferences, payment methods
- 🔔 **Notifications** - Push notifications for updates
- 📊 **Pricing Calculator** - Estimate delivery costs

### Rider App

- 📋 **Order Queue** - View available deliveries
- 📍 **Location Sharing** - GPS tracking
- 💰 **Earnings** - Track income and payouts

### Admin Dashboard

- 📊 **Analytics** - Revenue, orders, performance
- 👥 **User Management** - Customers, riders, admins
- 🗺️ **Live Map** - Monitor all active deliveries
- 📈 **Reports** - Export data and generate reports

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- PostgreSQL (or use Supabase)

### Installation

```bash
# Clone repository
git clone https://github.com/menoc61/tara-delivary.git
cd tara-delivery

# Install dependencies
pnpm install

# Setup environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit .env files with your credentials
```

### Database Setup

```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

### Start Development

```bash
# Start both API and Web
pnpm dev

# Or start individually
cd apps/api && npm run dev   # API on port 4000
cd apps/web && npm run dev   # Web on port 3000
```

### URLs

| Service  | Local URL                    | Description     |
| -------- | ---------------------------- | --------------- |
| Frontend | http://localhost:3000        | Next.js Web App |
| Backend  | http://localhost:4000        | Express API     |
| API Docs | http://localhost:4000/health | Health Check    |

---

## 🔐 Test Credentials

| Role     | Email                  | Password     |
| -------- | ---------------------- | ------------ |
| Admin    | admin@tara-delivery.cm | Admin@123456 |
| Customer | customer1@test.cm      | Customer@123 |
| Rider    | rider1@test.cm         | Rider@123    |

---

## 🔧 Environment Configuration

### Backend (`apps/api/.env`)

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Server
PORT=4000
API_BASE_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=your-secret
REFRESH_TOKEN_SECRET=your-refresh-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

### Frontend (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Build Individual Images

```bash
# Build API
docker build -f docker/api.Dockerfile -t tara-api .

# Build Web
docker build -f docker/web.Dockerfile -t tara-web .
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + VPS (Backend)

**Frontend on Vercel:**

1. Push code to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set Root Directory: `apps/web`
4. Add environment variables
5. Deploy

**Backend on VPS:**

```bash
# SSH to VPS
ssh root@your-vps-ip

# Clone and setup
git clone https://github.com/menoc61/tara-delivary.git
cd tara-delivery
docker compose up -d
```

### Option 2: VS Code Dev Tunnels (Development/Testing)

```bash
# Start services locally
pnpm dev

# In VS Code:
# 1. Ctrl+Shift+P → "Ports: Forward"
# 2. Forward ports 3000 and 4000
# 3. Use the HTTPS URLs provided
```

### Option 3: Cloudflare Tunnel (Stable URL)

```bash
# Install cloudflared
npm install -g cloudflared

# Login
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create tara-api

# Run tunnel
cloudflared tunnel run --url http://localhost:4000 tara-api
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| POST   | /api/auth/register        | Create account       |
| POST   | /api/auth/login           | Email/password login |
| GET    | /api/auth/google          | Google OAuth         |
| GET    | /api/auth/google/callback | OAuth callback       |
| POST   | /api/auth/refresh         | Refresh token        |
| GET    | /api/auth/me              | Current user         |

### Orders

| Method | Endpoint               | Description   |
| ------ | ---------------------- | ------------- |
| POST   | /api/orders            | Create order  |
| GET    | /api/orders/my         | User's orders |
| GET    | /api/orders/:id        | Order details |
| PATCH  | /api/orders/:id/status | Update status |
| POST   | /api/orders/:id/cancel | Cancel order  |

### Riders

| Method | Endpoint                | Description      |
| ------ | ----------------------- | ---------------- |
| GET    | /api/riders/me          | Rider profile    |
| PATCH  | /api/riders/me/status   | Set availability |
| POST   | /api/riders/me/location | Update location  |

### Payments

| Method | Endpoint                | Description    |
| ------ | ----------------------- | -------------- |
| POST   | /api/payments/initiate  | Start payment  |
| GET    | /api/payments/order/:id | Payment status |

---

## 🎨 Tech Stack

| Layer     | Technology                         |
| --------- | ---------------------------------- |
| Frontend  | Next.js 14, React 18, Tailwind CSS |
| Backend   | Node.js, Express, TypeScript       |
| Database  | PostgreSQL (Supabase)              |
| ORM       | Prisma                             |
| Auth      | JWT, Passport.js (Google OAuth)    |
| Payments  | MTN MoMo, Orange Money             |
| Maps      | Leaflet, OpenStreetMap             |
| Real-time | Supabase Realtime                  |
| PWA       | Service Worker, Web Manifest       |

---

## 📁 Project Structure

```
tara-delivery/
├── apps/
│   ├── api/                    # Express.js API
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules
│   │   │   ├── middleware/      # Auth, validation
│   │   │   └── config/         # DB, JWT, Supabase
│   │   └── prisma/             # Database schema
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/            # Pages (App Router)
│   │   │   ├── components/     # Reusable components
│   │   │   ├── store/          # Zustand state
│   │   │   └── lib/            # Utilities
│   │   └── public/             # Static assets, PWA
│   └── mobile/                 # React Native (future)
├── packages/
│   ├── types/                  # Shared TypeScript types
│   └── zod-schemas/            # Shared validation
├── docker/                     # Docker configurations
└── docker-compose.yml          # Full stack setup
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request

---

## 📄 License

MIT © 2026 TARA DELIVERY

---

Made with ❤️ in Yaoundé, Cameroun 🇨🇲
