# Dockerfile for Earthquakes-Ultra
# Next.js standalone output for optimized Docker image

FROM node:22-slim AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy ALL source files
COPY . .

# Build with standalone output
RUN npm run build

# Production image - minimal
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080

# Start the standalone server
CMD ["node", "server.js"]
