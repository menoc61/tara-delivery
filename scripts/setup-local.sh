#!/bin/bash

# setup-local.sh - Setup the TARA Delivery project locally

echo "🚀 Starting TARA Delivery local setup..."

# 1. Check prerequisites
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first (e.g., 'npm i -g pnpm')."
    exit 1
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# 3. Setup environment files
echo "⚙️ Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
else
    echo "ℹ️ .env already exists, skipping."
fi

# Apps specific env setup
for app in apps/api apps/web; do
    if [ ! -f "$app/.env" ]; then
        cp "$app/.env.example" "$app/.env" 2>/dev/null || true
        echo "✅ Setup .env for $app"
    fi
done

# 4. Prisma setup
echo "🗄️ Running database migrations..."
cd apps/api
pnpm db:generate
# Note: This assumes a PostgreSQL instance is already running as per .env
pnpm db:migrate
pnpm db:seed
cd ../..

echo "✨ Local setup complete! You can now run the project with 'pnpm dev'."
