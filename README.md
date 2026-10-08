# SofinWave landing page

Multilingual (English / Vietnamese / Chinese) marketing site for SofinWave, built with
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, and next-intl.

One app serves four hostnames, one per business vertical:

| Hostname                | Vertical                                     |
| ----------------------- | -------------------------------------------- |
| `sofinwave.com`         | IT consulting & implementation, including AI |
| `media.sofinwave.com`   | Video/content production, affiliate          |
| `finance.sofinwave.com` | Investing knowledge & tooling                |
| `academy.sofinwave.com` | Education                                    |

`proxy.ts` maps the `Host` header to a site and rewrites the request into `app/[site]/[locale]/`.

## Getting started

Requires Node.js 22 and pnpm (enable it with `corepack enable`; the version is pinned in
`package.json`).

```bash
pnpm install
pnpm dev        # http://localhost:3000 — serves the apex (tech) site
```

Pages live under a locale prefix: open <http://localhost:3000/en/home>.

## Scripts

| Command             | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Dev server (Turbopack)                   |
| `pnpm build`        | Production build                         |
| `pnpm start`        | Serve the production build               |
| `pnpm test`         | Run the Vitest suite once                |
| `pnpm lint`         | ESLint                                   |
| `pnpm format`       | Format with Biome                        |
| `pnpm format:check` | Verify formatting (what CI runs)         |

Docker workflows are wrapped as [mise](https://mise.jdx.dev) tasks — list them with
`mise tasks ls` (`local:*`, `prod:*`, `rpi:*`).

## Contributing

- Branch off and open PRs against **`develop`**, the integration branch.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced by
  commitlint); the pre-commit hook formats and lints staged files.
- Every message key must exist in all of `messages/en.json`, `vi.json`, and `zh.json`.

Architecture, SEO rules, and other conventions are documented in [`AGENTS.md`](AGENTS.md).
