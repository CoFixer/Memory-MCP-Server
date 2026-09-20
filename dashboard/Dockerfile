# ============================================
# Build stage: Bun latest + Node.js latest stable (24.x LTS)
# ============================================
FROM oven/bun:latest AS builder

WORKDIR /app

# Install Node.js 24.x LTS (latest stable) via NodeSource
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Verify installed versions
RUN echo "Bun version: $(bun --version)" && echo "Node version: $(node --version)"

# Copy package manifest
COPY package.json ./

# Install dependencies with Bun (ignores old lockfiles if present)
RUN bun install

# Copy source code and build
COPY . .

# Accept build-time API URL (e.g. https://api.yourdomain.com/api/v1)
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

ARG VITE_BASENAME=/
ENV VITE_BASENAME=${VITE_BASENAME}

RUN bun run build

# ============================================
# Production stage: lightweight nginx
# ============================================
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 8080

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
