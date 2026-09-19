# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Allow build scripts (required for bcrypt, @parcel/watcher, etc.)
RUN pnpm config set ignore-build-scripts false

# Copy lockfile and package manifest
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Rebuild native dependencies needed for the build / runtime
RUN pnpm rebuild bcrypt

COPY . .
RUN pnpm run build

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Allow build scripts (required for bcrypt, @parcel/watcher, etc.)
RUN pnpm config set ignore-build-scripts false

COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Rebuild native dependencies for production
RUN pnpm rebuild bcrypt

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main"]
