# Vercel Deployment Guide for TARA DELIVERY

## Quick Setup

### Method 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `menoc61/tara-delivery`
4. Configure the project settings:

   **Framework Preset:** Next.js

   **Root Directory:** `apps/web`

   **Build Command:** `pnpm build`

   **Output Directory:** `.next`

   **Install Command:** `pnpm install`

5. Add Environment Variables:

   ```
   NEXT_PUBLIC_API_URL=https://api.tara-delivery.cm/api
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

6. Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to the web app directory
cd apps/web

# Deploy
vercel

# For production deployment
vercel --prod
```

### Method 3: GitHub Integration

1. Push your code to GitHub
2. Vercel will automatically deploy on every push to main
3. Preview deployments for pull requests

## Important Notes

1. **Root Directory must be `apps/web`** - This tells Vercel where the Next.js app is located
2. **Environment Variables** - Only add `NEXT_PUBLIC_*` variables to Vercel
3. **API Backend** - Your API should be deployed separately (Hostinger VPS)
4. **PWA Support** - The manifest and service worker are included automatically

## Troubleshooting

### Build Fails

- Check that `Root Directory` is set to `apps/web`
- Ensure all environment variables are set
- Check build logs for specific errors

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on your backend
- Ensure backend is deployed and running

### PWA Not Installing

- Check that manifest.json is accessible
- Verify service-worker.js is registered
- HTTPS is required for PWA

## Files Configuration

The project includes:

- `vercel.json` - Vercel configuration for monorepo
- `.vercelignore` - Files to exclude from deployment
- `apps/web/public/manifest.json` - PWA manifest
- `apps/web/public/service-worker.js` - Service worker

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed by Vercel
4. SSL is automatic with Vercel
