# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Install latest npm (ensures native builds work reliably)
RUN npm install -g npm@latest

# Copy package manifest
COPY package.json ./

# Install all dependencies
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

# Install latest npm
RUN npm install -g npm@latest

COPY package.json ./

# Install production dependencies only
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main"]
