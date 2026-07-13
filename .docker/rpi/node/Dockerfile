# syntax=docker/dockerfile:1

# Multi-stage production image for Raspberry Pi (arm64), Next.js standalone output.
# Built natively on the Pi. Uses pnpm (the project's source-of-truth lockfile),
# not yarn like the older dev/prod images.

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ── deps: install with a frozen lockfile ─────────────────────────────
# --ignore-scripts skips the package's own `prepare` (husky, which needs a .git
# that isn't in the build context) and dependency build scripts (not needed:
# sharp ships prebuilt arm64 binaries via optionalDependencies).
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts

# ── build: compile the standalone server ─────────────────────────────
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ── run: minimal runtime, just the standalone output ─────────────────
FROM node:22-bookworm-slim AS run
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app

# next.config output:"standalone" emits a self-contained server bundle.
# i18n message JSON is included via Next's build-time file tracing.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/en').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
