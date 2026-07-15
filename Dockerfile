# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY patches ./patches
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE=/api
ARG API_PROXY_TARGET=https://api.injaro.info
ARG NEXT_PUBLIC_SITE_URL=https://app.injaro.info
ARG NEXT_PUBLIC_LANDING_URL=https://injaro.info
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
ARG NEXT_PUBLIC_GA_ID=

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV API_PROXY_TARGET=$API_PROXY_TARGET
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_LANDING_URL=$NEXT_PUBLIC_LANDING_URL
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=$NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
