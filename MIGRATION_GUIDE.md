# Migration Guide: Firebase → Supabase, Google Maps → OpenStreetMap

## Overview

This guide covers the completed migration from Firebase to Supabase and from Google Maps to MapLibre GL JS with OpenStreetMap.

---

## Part 1: Supabase Setup

### 1. Create Supabase Project

1. Go to https://supabase.com and sign up
2. Create a new project
3. Note down:
   - Project URL (`SUPABASE_URL`)
   - `anon` public API key (`SUPABASE_ANON_KEY`)
   - `service_role` secret key (`SUPABASE_SERVICE_KEY`)

### 2. Database Migration

Supabase uses PostgreSQL, so your Prisma schema should work directly:

```bash
# Update DATABASE_URL to use Supabase connection string
# Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Run migrations
pnpm db:migrate

# Or if starting fresh, push schema
pnpm db:push
```

### 3. Real-time Configuration

In Supabase Dashboard:
1. Go to Database → Replication
2. Enable realtime for these tables:
   - `rider` (for location updates)
   - `order` (for status updates)
   - `notification` (for new notifications)

---

## Part 2: Replace Suberbase Code

### Backend Changes

**Install Supabase client:**
```bash
cd apps/api
pnpm add @supabase/supabase-js
```

**Create new config file** (`apps/api/src/config/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Realtime channel for rider locations
export const subscribeToRiderUpdates = (callback: (payload: any) => void) => {
  return supabase
    .channel('rider-locations')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rider' }, callback)
    .subscribe();
};

// Realtime channel for order updates
export const subscribeToOrderUpdates = (orderId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order', filter: `id=eq.${orderId}` }, callback)
    .subscribe();
};
```

**Update rider location** (`apps/api/src/modules/riders/rider.service.ts`):

Replace Suberbase RTDB update with Supabase:
```typescript
// OLD (Suberbase)
// await SuberbaseDB.ref(`rider_locations/${riderId}`).set(location);

// NEW (Supabase) - Update rider table directly
await prisma.rider.update({
  where: { userId: riderId },
  data: {
    currentLat: location.lat,
    currentLng: location.lng,
    updatedAt: new Date()
  }
});

// Realtime update is automatic via database triggers
```

**Update order status** (`apps/api/src/modules/orders/order.service.ts`):

```typescript
// The order update will automatically trigger Supabase Realtime
// Clients subscribed to the order channel will receive updates
```

### Frontend Changes

**Install Supabase client:**
```bash
cd apps/web
pnpm add @supabase/supabase-js
```

**Create Supabase client** (`apps/web/src/lib/supabase-client.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Subscribe to rider location updates
export const subscribeToRiderLocation = (riderId: string, callback: (location: { lat: number; lng: number }) => void) => {
  return supabase
    .channel(`rider-${riderId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rider', filter: `userId=eq.${riderId}` }, (payload) => {
      callback({
        lat: payload.new.currentLat,
        lng: payload.new.currentLng
      });
    })
    .subscribe();
};

// Subscribe to order updates
export const subscribeToOrderUpdates = (orderId: string, callback: (order: any) => void) => {
  return supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order', filter: `id=eq.${orderId}` }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
};

// Cleanup subscription
export const unsubscribe = (channel: any) => {
  supabase.removeChannel(channel);
};
```

### Push Notifications Migration

Replace FCM with Web Push API:

**Backend** - Install web-push:
```bash
cd apps/api
pnpm add web-push
```

Create `apps/api/src/config/web-push.ts`:
```typescript
import webPush from 'web-push';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

webPush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidPublicKey,
  vapidPrivateKey
);

export { webPush };
```

Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

**Frontend** - Service worker registration:
```typescript
// apps/web/public/service-worker.js
self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png'
  });
});
```

---

## Part 3: Replace Google Maps

### Install MapLibre

```bash
cd apps/web
pnpm add maplibre-gl
pnpm add -D @types/maplibre-gl
```

### Create Map Component

**New file** (`apps/web/src/components/Map.tsx`):
```tsx
'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; label?: string }>;
  onClick?: (lngLat: [number, number]) => void;
}

export function Map({ center = [3.848, 11.502], zoom = 12, markers = [], onClick }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // Free demo style
      // OR use OpenStreetMap tiles:
      // style: {
      //   version: 8,
      //   sources: {
      //     'osm': {
      //       type: 'raster',
      //       tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      //       tileSize: 256
      //     }
      //   },
      //   layers: [{
      //     id: 'osm',
      //     type: 'raster',
      //     source: 'osm'
      //   }]
      // },
      center,
      zoom
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl());

    // Handle click
    if (onClick) {
      map.current.on('click', (e) => {
        onClick([e.lngLat.lng, e.lngLat.lat]);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers (simple approach)
    const markersEl = document.querySelectorAll('.maplibregl-marker');
    markersEl.forEach(el => el.remove());

    // Add new markers
    markers.forEach(marker => {
      new maplibregl.Marker()
        .setLngLat([marker.lng, marker.lat])
        .setPopup(new maplibregl.Popup().setText(marker.label || ''))
        .addTo(map.current!);
    });
  }, [markers]);

  // Update center
  useEffect(() => {
    map.current?.setCenter(center);
  }, [center]);

  return <div ref={mapContainer} className="w-full h-full min-h-[400px]" />;
}
```

### Update Components Using Maps

Replace any Google Maps usage with the new Map component.

---

## Part 4: Deployment Configuration

### Vercel Environment Variables

Add these to your Vercel project:
```
NEXT_PUBLIC_API_URL=https://api.englishlanguagecertificate.com/api
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### VPS (Hostinger) Environment Variables

SSH to 168.231.82.118 and set up:

```bash
# Create .env file in /opt/tara-delivery or use docker-compose env
DATABASE_URL=postgresql://...
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
CORS_ORIGIN=https://tara-delivery.vercel.app

# Web Push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Payment APIs
MOMO_SUBSCRIPTION_KEY=
MOMO_API_USER=
MOMO_API_KEY=
ORANGE_CLIENT_ID=
ORANGE_CLIENT_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Docker Compose for VPS

Update `docker-compose.yml` for production:
```yaml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: docker/api.Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - CORS_ORIGIN=${CORS_ORIGIN}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=7d
      # ... other env vars
    ports:
      - "4000:4000"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - api
    restart: unless-stopped
```

### Nginx Configuration

Update `docker/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:4000;
    }

    server {
        listen 80;
        server_name api.englishlanguagecertificate.com;

        location / {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### SSL with Let's Encrypt

```bash
# On VPS, install certbot
docker run -it --rm \
  -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d api.englishlanguagecertificate.com
```

---

## Part 5: Testing Checklist

- [ ] Supabase connection working
- [ ] Real-time rider location updates working
- [ ] Real-time order status updates working
- [ ] Map displays correctly with OpenStreetMap tiles
- [ ] Push notifications working with Web Push
- [ ] Payment webhooks receiving correctly
- [ ] CORS configured for production domains
- [ ] SSL certificates installed
- [ ] Database migrations run on production
- [ ] Environment variables set correctly on both Vercel and VPS

---

## Cost Comparison

| Service | Before | After |
|---------|--------|-------|
| Database | Suberbase RTDB (paid) | Supabase (500MB free, then $25/GB) |
| Push Notifications | FCM (free) | Web Push (free) or OneSignal (free tier) |
| Maps | Google Maps ($200 credit/mo) | MapLibre + OSM (free) |
| Hosting | - | Hostinger VPS (~$5-10/mo) |
| Frontend | - | Vercel (free tier) |

**Estimated monthly cost: $0-25** (depending on database size)
