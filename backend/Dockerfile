# Build stage
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy package manifest
COPY package.json ./

# Install all dependencies
RUN bun install

COPY . .
RUN bun run build

# Production stage
FROM oven/bun:alpine AS production

WORKDIR /app

# Copy package manifest
COPY package.json ./

# Install production dependencies only
RUN bun install --production

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "dist/main"]
