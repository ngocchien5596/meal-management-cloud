# Base stage for shared dependencies and configuration
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Stage 1: Build
FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile

# Set environment variables for build if necessary
# NEXT_PUBLIC_API_URL should be set during build if it's baked into the client
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app/apps/web
RUN pnpm build

# Stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Copy the server file that next build --standalone generates
# It is located at .next/standalone/apps/web/server.js
# But when we copy standalone to /, it ends up at /apps/web/server.js

EXPOSE 3000
ENV PORT 3000

# Next.js standalone server
CMD ["node", "apps/web/server.js"]
