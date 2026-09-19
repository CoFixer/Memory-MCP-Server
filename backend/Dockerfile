# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy lockfile and package manifest
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (allow native builds for bcrypt, etc.)
RUN pnpm install --frozen-lockfile --allow-build=bcrypt --allow-build=@parcel/watcher --allow-build=@scarf/scarf --allow-build=unrs-resolver

# Rebuild native dependencies needed for the build / runtime
RUN pnpm rebuild bcrypt

COPY . .
RUN pnpm run build

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# Install production dependencies only (allow native builds for bcrypt, etc.)
RUN pnpm install --frozen-lockfile --prod --allow-build=bcrypt --allow-build=@parcel/watcher --allow-build=@scarf/scarf --allow-build=unrs-resolver

# Rebuild native dependencies for production
RUN pnpm rebuild bcrypt

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main"]
