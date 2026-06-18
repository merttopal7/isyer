# ── Stage 1: Dependencies (Linux build tools for native addons) ──
FROM node:20-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: Builder ──────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_PRODUCTION=false
ARG NEXT_PUBLIC_BASE_DOMAIN=
ENV NEXT_PUBLIC_PRODUCTION=$NEXT_PUBLIC_PRODUCTION
ENV NEXT_PUBLIC_BASE_DOMAIN=$NEXT_PUBLIC_BASE_DOMAIN
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# ── Stage 3: Migrator (knexfile.ts + ts-node gerektirir) ──────────
FROM node:20-slim AS migrator
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY knexfile.ts ./
COPY migrations ./migrations
COPY seeds ./seeds

# ── Stage 4: Runner ───────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# better-sqlite3 native binary (Linux'ta derlendi, runtime'da lazım olabilir)
COPY --from=deps /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=deps /app/node_modules/bindings ./node_modules/bindings
COPY --from=deps /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# sharp native binary (Linux'ta derlendi, WebP dönüşümü için gerekli)
COPY --from=deps /app/node_modules/sharp ./node_modules/sharp
COPY --from=deps /app/node_modules/@img ./node_modules/@img
COPY --from=deps /app/node_modules/detect-libc ./node_modules/detect-libc

EXPOSE 3000
CMD ["node", "server.js"]
