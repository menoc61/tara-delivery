# 🚀 Deployment Guide

## Deployment Options

### Option 1: Vercel (Frontend) + VPS (Backend)

**Frontend on Vercel:**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set Root Directory: `apps/web`
4. Add environment variables
5. Deploy

**Backend on VPS:**

```bash
# SSH to VPS
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repository
git clone https://github.com/menoc61/tara-delivary.git /opt/tara-delivery
cd /opt/tara-delivery

# Setup environment
cp apps/api/.env.example apps/api/.env
# Edit .env with production values

# Start with Docker
docker compose up -d

# Run migrations
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

---

### Option 2: Full Docker Deployment (VPS)

```bash
# 1. SSH to VPS
ssh root@your-vps-ip

# 2. Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh

# 3. Clone repository
git clone https://github.com/menoc61/tara-delivary.git /opt/tara-delivery
cd /opt/tara-delivery

# 4. Create .env file
cat > apps/api/.env << EOF
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/tara_delivery
PORT=4000
JWT_SECRET=$(openssl rand -hex 32)
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
CORS_ORIGIN=https://your-domain.com,https://tara-delivery-web.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
EOF

cat > apps/web/.env << EOF
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

# 5. Start services
docker compose up -d

# 6. Run migrations
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed

# 7. Setup SSL (Let's Encrypt)
apt install -y certbot
certbot certonly --standalone -d your-domain.com

# 8. Update nginx.conf with your domain
# 9. Start with nginx
docker compose --profile production up -d
```

---

### Option 3: Vercel Deployment Only (Frontend)

For frontend-only deployment with remote API:

1. **Push to GitHub**
2. **Import on Vercel**
3. **Configure:**
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Build Command: `pnpm build`
4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. **Deploy**

---

## Docker Commands Reference

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild after changes
docker compose up -d --build

# Access container
docker compose exec api sh

# Run migrations
docker compose exec api npx prisma migrate deploy

# Seed database
docker compose exec api npx prisma db seed

# View running containers
docker ps
```

---

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Server
PORT=4000
NODE_ENV=production

# JWT
JWT_SECRET=your-secret
REFRESH_TOKEN_SECRET=your-refresh-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback

# CORS
CORS_ORIGIN=https://your-domain.com,https://tara-delivery-web.vercel.app

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-domain.com/api/auth/google/callback`
   - `http://localhost:4000/api/auth/google/callback`

---

## SSL Certificate (Let's Encrypt)

```bash
# Install certbot
apt install -y certbot

# Get certificate
certbot certonly --standalone -d your-domain.com

# Certificate locations
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# Auto-renewal
certbot renew --dry-run
```

---

## Nginx Configuration

Update `docker/nginx.conf` with your domain:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    location /api {
        proxy_pass http://api:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs api

# Check if ports are in use
netstat -tlnp | grep -E '3000|4000'
```

### Database connection failed

```bash
# Check postgres container
docker compose ps postgres

# Test connection
docker compose exec postgres psql -U postgres -d tara_delivery
```

### Build fails

```bash
# Clean build
docker compose down
docker system prune -f
docker compose build --no-cache
docker compose up -d
```
