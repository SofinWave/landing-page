# RPI Docker environment with Caddy — Design

Date: 2026-07-13

## Goal

Add a self-contained `rpi` Docker environment for running the landing page on a
Raspberry Pi (arm64), with a **Caddy** reverse proxy in front of the Next.js app.
Public TLS is handled upstream (Cloudflare Tunnel / another proxy), so Caddy
serves plain HTTP.

## Topology

```
[Cloudflare Tunnel / upstream proxy]   ← external, not in this compose
              │ http
              ▼
   caddy  :8003 published to host as ${CADDY_HTTP_PORT:-8003}
              │ reverse_proxy over network_app (internal bridge)
              ▼
   node   :3000  NOT published — only reachable via Caddy
```

Only Caddy is exposed to the host. The Next.js container is internal-only.

## Structure

New `rpi` environment mirrors the existing `prod` override pattern
(`docker-compose.yml` base + a per-env override + `.mise/tasks/<env>/*`).
`local` and `prod` are left untouched.

### New files

| File | Purpose |
|---|---|
| `.docker/rpi/node/Dockerfile` | Multi-stage standalone build (deps → build → slim runtime) |
| `.docker/rpi/caddy/Caddyfile` | `:80` reverse proxy + compression |
| `docker-compose.rpi.yml` | Override: `node` (rpi image, no ports, healthcheck) + new `caddy` service |
| `.mise/tasks/rpi/{up,down,start,stop,restart,rm,logs}` | Mirror `prod/*`, `COMPOSE_FILE=docker-compose.yml:docker-compose.rpi.yml`, load `.env.rpi` when present |
| `.env.rpi.example` | Committed template for the gitignored `.env.rpi` |

### Changed files

- `next.config.ts` — add `output: "standalone"` (required for the slim runtime
  image; inert for local dev and Vercel).

### Config / env

- `APP_NAME` is **not** read by the app — it only named containers via compose
  interpolation. The rpi containers use **static names**
  (`kingnnt-dot-org_rpi_{node,caddy}`), so rpi needs no `APP_NAME`.
- Caddy's host port defaults to **8003** (`${CADDY_HTTP_PORT:-8003}`).
- rpi-specific config lives in `.env.rpi` (gitignored via `.env*`; template in
  `.env.rpi.example`). It's **optional**: the node service loads it with
  `required: false`, and the `rpi:*` tasks pass `--env-file .env.rpi` only when
  the file exists. The base `.env` stays dev-only.

## Node image (`.docker/rpi/node/Dockerfile`)

- Base `node:22-bookworm-slim` (multi-arch; builds natively on arm64).
- **deps**: `corepack enable` → `pnpm install --frozen-lockfile` from
  `pnpm-lock.yaml` (the project's source-of-truth lockfile per CLAUDE.md — not
  yarn like the older dev/prod Dockerfiles, which are left unchanged).
- **build**: copy source → `pnpm build` → emits `.next/standalone`.
- **run**: copy `standalone` + `.next/static` + `public` into a fresh slim image,
  run as the non-root `node` user, `HOSTNAME=0.0.0.0`, `PORT=3000`,
  `CMD ["node","server.js"]`.
- i18n message JSON files are pulled in by Next's build-time file tracing (the
  `import(\`../messages/${locale}.json\`)` context), so they ship inside
  `.next/standalone`.
- **Healthcheck**: `node -e "fetch('http://localhost:3000/en')…"` — Node 22
  built-in fetch, no extra packages. Probes `/en` because `localePrefix:"always"`
  makes `/` a redirect.

## Caddy (`.docker/rpi/caddy/Caddyfile`)

```
:80 {
    encode zstd gzip
    reverse_proxy node:3000
}
```

Plain HTTP; upstream terminates TLS. Caddy provides compression, clean upstream
routing, and a single place to add headers / rate-limits later.

## Compose (`docker-compose.rpi.yml`)

- `node`: overrides base to build `.docker/rpi/node/Dockerfile`, **no published
  ports**, `env_file: .env`, `healthcheck`, `restart: unless-stopped`.
- `caddy`: `image: caddy:2-alpine`, `ports: ["${CADDY_HTTP_PORT:-80}:80"]`,
  mounts the Caddyfile read-only + named volumes `caddy_data` / `caddy_config`,
  `depends_on: node (condition: service_healthy)`, on `network_app`.

## Out of scope

- No `cloudflared` container (upstream/external per decision). Can be co-located
  later if desired.
- `docker-compose.prod.yml` and the yarn-based dev/prod Dockerfiles are unchanged.
