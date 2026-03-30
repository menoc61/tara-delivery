# 🏠 Local Development Guide - TARA DELIVERY

## Quick Start

### Option 1: Manual Setup (No Docker)

```bash
# 1. Clone repository
git clone https://github.com/menoc61/tara-delivary.git
cd tara-delivery

# 2. Install dependencies
pnpm install

# 3. Setup environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Update apps/api/.env with local settings:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tara_delivery
PORT=4000
JWT_SECRET=local-dev-secret
REFRESH_TOKEN_SECRET=local-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# 5. Update apps/web/.env:
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# 6. Start PostgreSQL (install locally or use Docker)
docker compose up -d postgres

# 7. Run migrations
cd apps/api
npx prisma migrate dev
npx prisma db seed

# 8. Start services (from project root)
pnpm dev

# Services available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

---

### Option 2: Docker Setup (Full Stack)

```bash
# 1. Clone repository
git clone https://github.com/menoc61/tara-delivary.git
cd tara-delivery

# 2. Start all services with Docker
docker compose up -d

# 3. Run migrations (first time only)
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed

# Services available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# PostgreSQL: localhost:5432
```

---

## Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild containers
docker compose up -d --build

# Access API container
docker compose exec api sh

# Run migrations
docker compose exec api npx prisma migrate deploy

# Seed database
docker compose exec api npx prisma db seed

# View running containers
docker ps

# Remove all containers and volumes
docker compose down -v
```

---

## Test Credentials

After running database seed:

| Role     | Email                  | Password     |
| -------- | ---------------------- | ------------ |
| Admin    | admin@tara-delivery.cm | Admin@123456 |
| Customer | customer1@test.cm      | Customer@123 |
| Rider    | rider1@test.cm         | Rider@123    |

---

## Environment Configuration

### Backend (`apps/api/.env`)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tara_delivery

# Server
PORT=4000
NODE_ENV=development

# JWT Secrets
JWT_SECRET=local-dev-secret-change-in-production
REFRESH_TOKEN_SECRET=local-refresh-secret-change-in-production

# CORS
CORS_ORIGIN=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000

# Supabase (if using cloud)
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

## Development Commands

```bash
# Start all services
pnpm dev

# Start only API
cd apps/api && npm run dev

# Start only Web
cd apps/web && npm run dev

# Build all packages
pnpm build

# Database commands
cd apps/api
npx prisma migrate dev    # Run migrations
npx prisma db seed        # Seed database
npx prisma studio         # Open database GUI
npx prisma generate       # Generate Prisma client

# Code quality
pnpm lint                 # Run linters
pnpm format               # Format code
pnpm test                 # Run tests
pnpm type-check           # TypeScript check
```

---

## Using VS Code Dev Tunnels (Remote Access)

To test on other devices or share with others:

1. Start services locally: `pnpm dev`
2. In VS Code: `Ctrl+Shift+P` → "Ports: Forward"
3. Forward ports 3000 and 4000
4. Copy the HTTPS URLs
5. Update `.env` files with tunnel URLs
6. Restart services

---

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :4000
kill -9 <PID>
```

### Database Connection Failed

```bash
docker compose ps postgres
docker compose logs postgres
```

### Dependencies Not Found

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Prisma Client Out of Sync

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

---

## Project Structure

```
tara-delivery/
├── apps/
│   ├── api/          # Express.js backend
│   │   ├── src/      # Source code
│   │   └── prisma/   # Database schema
│   └── web/          # Next.js frontend
│       └── src/      # Source code
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── zod-schemas/  # Shared validation schemas
├── docker/           # Docker configurations
├── docker-compose.yml
└── package.json
```
