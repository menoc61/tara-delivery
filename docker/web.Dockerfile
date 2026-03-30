FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/zod-schemas/package.json ./packages/zod-schemas/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Build shared packages
RUN pnpm build --filter=@tara/types --filter=@tara/zod-schemas

# Build Next.js
RUN pnpm build --filter=@tara/web

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["cd", "apps/web", "&&", "npm", "start"]