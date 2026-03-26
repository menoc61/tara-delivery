# Deployment Guide

Complete deployment instructions for TARA Delivery platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                              │
├──────────────┬──────────────────┬───────────────────────────┤
│   Browser    │   Mobile App     │      Admin Panel          │
└──────┬───────┴────────┬───────────┴───────────────┬───────────┘
       │                │                         │
       └────────────────┴─────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │   Vercel (Frontend)   │
              │  tara-delivery.       │
              │     vercel.app        │
              └───────────┬───────────┘
                          │ API Calls
       ┌──────────────────┼──────────────────┐
       │                  │                  │
┌──────▼──────┐  ┌─────────▼─────────┐  ┌────▼────────┐
│   Supabase  │  │  Hostinger VPS    │  │   Redis     │
│  (Database) │  │  168.231.82.118   │  │  (Cache)    │
│  Realtime   │  │                   │  │             │
└─────────────┘  │  api.english-     │  └─────────────┘
                 │  languagecerti-   │
                 │  ficate.com        │
                 └───────────────────┘
```

## Prerequisites

1. **Vercel Account** - For frontend hosting (free)
2. **Supabase Account** - For database and realtime features (free tier)
3. **Hostinger VPS** - For backend API (IP: 168.231.82.118)
4. **Domain** - api.englishlanguagecertificate.com
5. **GitHub Account** - For CI/CD

---

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, get your credentials from Settings → API:
   - `Project URL` → `SUPABASE_URL`
   - `anon` public API key → `SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_KEY`

3. Enable Realtime:
   - Go to Database → Replication
   - Enable realtime for tables: `rider`, `order`, `notification`

4. Get Database Connection String:
   - Go to Settings → Database → Connection string
   - Choose "Prisma" format
   - This goes in `DATABASE_URL`

---

## Step 2: Backend Deployment (Hostinger VPS)

### Initial VPS Setup

SSH into your VPS:
```bash
ssh root@168.231.82.118
```

Run the setup script:
```bash
# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/menoc61/tara-delivery/main/scripts/deploy-vps.sh -o deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

### Manual Setup (if script fails)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create directories
mkdir -p /opt/tara-delivery
cd /opt/tara-delivery

# Clone repository
git clone https://github.com/menoc61/tara-delivary.git .
```

### Environment Configuration

Create the environment file:
```bash
sudo nano /opt/tara-delivery/.env
```

Paste the contents from `apps/api/.env.example` and fill in your actual values.

### SSL Certificate (Let's Encrypt)

```bash
# Get SSL certificate
docker run -it --rm \
  -v /opt/tara-delivery/certbot/conf:/etc/letsencrypt \
  -v /opt/tara-delivery/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d api.englishlanguagecertificate.com
```

### Start Services

```bash
cd /opt/tara-delivery
docker-compose up -d
```

### Verify Deployment

```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f api

# Test API
curl https://api.englishlanguagecertificate.com/health
```

---

## Step 3: Frontend Deployment (Vercel)

### Connect to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Configure build settings:
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && pnpm build --filter=web`
4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://api.englishlanguagecertificate.com/api`
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key

### Configure Custom Domain

1. In Vercel dashboard, go to your project → Settings → Domains
2. Add `tara-delivery.vercel.app` (or your custom domain)

---

## Step 4: Database Migration

Run migrations on the production database:

```bash
# On your local machine with production DATABASE_URL
export DATABASE_URL="your-supabase-connection-string"
cd apps/api
npx prisma migrate deploy
```

Or via Supabase Dashboard SQL Editor, run the SQL from:
```bash
cat apps/api/prisma/migrations/*/migration.sql
```

---

## Step 5: CI/CD Setup

### GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
# VPS Deployment
VPS_USER=root
VPS_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----

# Vercel Deployment
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# GitHub Container Registry (auto-generated)
GITHUB_TOKEN
```

### Get Vercel Credentials

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Get token
vercel tokens create

# Get org and project IDs
vercel env ls
```

---

## Step 6: Post-Deployment Checklist

### Backend Tests
```bash
# Health check
curl https://api.englishlanguagecertificate.com/health

# API test
curl https://api.englishlanguagecertificate.com/api/health

# Auth test (should return 401 without token)
curl https://api.englishlanguagecertificate.com/api/users/me
```

### Frontend Tests
- [ ] Website loads at https://tara-delivery.vercel.app
- [ ] Login/registration works
- [ ] Real-time location updates work
- [ ] Orders can be created
- [ ] Map displays correctly
- [ ] Push notifications work (if enabled)

### Supabase Tests
- [ ] Data appears in Supabase tables
- [ ] Realtime subscriptions working
- [ ] Database connections stable

---

## Troubleshooting

### CORS Errors
If you see CORS errors in browser:
```bash
# Check CORS_ORIGIN on VPS matches your frontend domain
docker-compose exec api env | grep CORS

# Update if needed
sudo nano /opt/tara-delivery/.env
docker-compose restart api
```

### Database Connection Issues
```bash
# Test connection
psql "your-supabase-connection-string" -c "SELECT 1;"

# Check firewall
sudo ufw status
```

### Container Won't Start
```bash
# Check logs
docker-compose logs api

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### SSL Certificate Issues
```bash
# Renew certificate
docker run -it --rm \
  -v /opt/tara-delivery/certbot/conf:/etc/letsencrypt \
  certbot/certbot renew
```

---

## Monitoring

### View Logs
```bash
# API logs
docker-compose logs -f api

# All services
docker-compose logs -f

# Specific time range
docker-compose logs --since="2024-01-01T00:00:00"
```

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
df -h

# Memory
free -h
```

---

## Backup Strategy

### Database (Supabase)
Supabase provides automatic backups:
- Free tier: Daily backups retained for 7 days
- Pro tier: PITR (Point in Time Recovery)

### Manual Backup
```bash
# Export database
pg_dump "your-connection-string" > backup-$(date +%Y%m%d).sql

# Download to local
scp root@168.231.82.118:/opt/tara-delivery/backup-*.sql ./
```

---

## Security Checklist

- [ ] JWT secrets are strong and unique
- [ ] VAPID keys generated and kept secret
- [ ] Database URL uses SSL
- [ ] VPS firewall configured (only 22, 80, 443 open)
- [ ] CORS_ORIGIN set to exact frontend domain
- [ ] Environment files not committed to git
- [ ] Supabase RLS (Row Level Security) policies configured

---

## Cost Breakdown

| Service | Provider | Monthly Cost |
|---------|----------|--------------|
| Frontend Hosting | Vercel | $0 (free tier) |
| Database + Realtime | Supabase | $0 (500MB limit) |
| VPS (Backend) | Hostinger | ~$5-10 |
| Domain | Your registrar | ~$10-15/year |
| SSL | Let's Encrypt | $0 |
| Maps | OpenStreetMap | $0 |
| **Total** | | **~$5-10/month** |
