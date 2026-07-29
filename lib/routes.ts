import { SiteId } from "@/enums";

/**
 * Single source of truth for every public route, per site.
 *
 * Navigation, sitemaps, breadcrumbs, and the generated llms.txt all read from
 * this registry, so they cannot drift apart. Adding a page means adding an entry
 * here plus its copy under that site's content namespace in both catalogs.
 */

export type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";

export interface RouteDef {
  /** Path after the locale prefix, without leading or trailing slashes. */
  path: string;
  /** Key under the site's content message namespace holding this route's copy. */
  key: string;
  /** Parent route path, used to build breadcrumb trails. */
  parent?: string;
  priority: number;
  changeFrequency: ChangeFrequency;
  /**
   * ISO date this page's copy last changed, when it differs from the site-wide
   * `CONTENT_LAST_MODIFIED`. Most pages are edited together and can omit it.
   */
  lastModified?: string;
}

/** Landing page path, shared by every site. `/{locale}` redirects here. */
export const HOME_PATH = "home";

/**
 * Date the site's copy last changed, feeding both `<lastmod>` in the sitemaps
 * and `dateModified` in the page schema. **Bump it when you edit the message
 * catalogs**, not when you deploy.
 *
 * It is a constant rather than the build clock because the build clock restamps
 * every URL on every deploy: a page untouched for months would claim to have
 * changed minutes ago. Search engines discount a `lastmod` that behaves that
 * way, and answer engines weigh freshness when choosing what to cite — a signal
 * only worth having if it is true.
 */
export const CONTENT_LAST_MODIFIED = "2026-07-29";

/** A route's own modification date, falling back to the site-wide one. */
export function routeLastModified(route: RouteDef): string {
  return route.lastModified ?? CONTENT_LAST_MODIFIED;
}

const home: RouteDef = { path: HOME_PATH, key: "home", priority: 1, changeFrequency: "monthly" };

const TECH_ROUTES: readonly RouteDef[] = [
  home,

  {
    path: "vietnam-it-consulting",
    key: "vietnamItConsulting",
    parent: HOME_PATH,
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "ventures",
    key: "ventures",
    parent: HOME_PATH,
    priority: 0.6,
    changeFrequency: "yearly",
  },

  {
    path: "services",
    key: "services",
    parent: HOME_PATH,
    priority: 0.9,
    changeFrequency: "monthly",
  },
  // The advisory pillar, and the highest-priority service page: what to build,
  // whether to build it, and how it should be shaped — across software and AI
  // alike. AI advice lives here rather than on a page of its own, which would
  // only restate `services/ai-implementation` at a thinner word count.
  {
    path: "services/it-consulting",
    key: "itConsulting",
    parent: "services",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  // One page for the ways a team can be shaped, not one page per way. Three
  // near-identical pages for renting engineers read as a staffing catalogue,
  // which is the opposite of what the rest of this site claims to be.
  {
    path: "services/delivery-teams",
    key: "deliveryTeams",
    parent: "services",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "services/staff-augmentation",
    key: "staffAugmentation",
    parent: "services",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "services/software-engineering",
    key: "softwareEngineering",
    parent: "services",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "services/system-integration",
    key: "systemIntegration",
    parent: "services",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "services/devops-cloud",
    key: "devopsCloud",
    parent: "services",
    priority: 0.7,
    changeFrequency: "monthly",
  },

  // AI delivery. Distinct pages because "build us an AI feature", "connect an
  // LLM to our data", and "automate this workflow with agents" are different
  // purchases with different queries behind them.
  {
    path: "services/ai-implementation",
    key: "aiImplementation",
    parent: "services",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "services/llm-integration",
    key: "llmIntegration",
    parent: "services",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "services/ai-agents",
    key: "aiAgents",
    parent: "services",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "services/ai-training-data",
    key: "aiTrainingData",
    parent: "services",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "services/data-collection",
    key: "dataCollection",
    parent: "services",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "services/egocentric-data-collection",
    key: "egocentricDataCollection",
    parent: "services/data-collection",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "services/data-annotation",
    key: "dataAnnotation",
    parent: "services",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "services/rlhf-sft-data",
    key: "rlhfSftData",
    parent: "services",
    priority: 0.8,
    changeFrequency: "monthly",
  },

  {
    path: "engagement-models",
    key: "engagementModels",
    parent: HOME_PATH,
    priority: 0.8,
    changeFrequency: "monthly",
  },

  {
    path: "industries/fintech",
    key: "fintech",
    parent: HOME_PATH,
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "industries/ecommerce",
    key: "ecommerce",
    parent: HOME_PATH,
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "industries/logistics",
    key: "logistics",
    parent: HOME_PATH,
    priority: 0.7,
    changeFrequency: "monthly",
  },

  { path: "about", key: "about", parent: HOME_PATH, priority: 0.6, changeFrequency: "yearly" },
  { path: "contact", key: "contact", parent: HOME_PATH, priority: 0.6, changeFrequency: "yearly" },
];

const MEDIA_ROUTES: readonly RouteDef[] = [
  home,
  { path: "about", key: "about", parent: HOME_PATH, priority: 0.6, changeFrequency: "yearly" },
  { path: "contact", key: "contact", parent: HOME_PATH, priority: 0.6, changeFrequency: "yearly" },
];

const FINANCE_ROUTES: readonly RouteDef[] = [
  home,
  { path: "about", key: "about", parent: HOME_PATH, priority: 0.6, changeFrequency: "yearly" },
  { path: "contact", key: "contact", parent: HOME_PATH, priority: 0.6, changeFrequency: "yearly" },
  // Not optional. Investing content is YMYL, and the scope of what this site
  // does and does not offer has to be stated somewhere linkable.
  {
    path: "disclaimer",
    key: "disclaimer",
    parent: HOME_PATH,
    priority: 0.5,
    changeFrequency: "yearly",
  },
];

const ACADEMY_ROUTES: readonly RouteDef[] = [
  home,
  { path: "about", key: "about", parent: HOME_PATH, priority: 0.6, changeFrequency: "yearly" },
  { path: "contact", key: "contact", parent: HOME_PATH, priority: 0.6, changeFrequency: "yearly" },
];

export const ROUTES_BY_SITE: Record<SiteId, readonly RouteDef[]> = {
  [SiteId.Tech]: TECH_ROUTES,
  [SiteId.Media]: MEDIA_ROUTES,
  [SiteId.Finance]: FINANCE_ROUTES,
  [SiteId.Academy]: ACADEMY_ROUTES,
};

export function routesFor(site: SiteId): readonly RouteDef[] {
  return ROUTES_BY_SITE[site];
}

/** Every route of a site except its landing page — those the content shell renders. */
export function contentRoutesFor(site: SiteId): RouteDef[] {
  return routesFor(site).filter((r) => r.path !== HOME_PATH);
}

export function findRoute(site: SiteId, path: string): RouteDef | undefined {
  return routesFor(site).find((r) => r.path === path);
}

/**
 * Breadcrumb trail for a route, ordered root-first and including the route
 * itself. Returns an empty trail when the path is not a route of that site.
 */
export function breadcrumbTrail(site: SiteId, path: string): RouteDef[] {
  const trail: RouteDef[] = [];
  let current = findRoute(site, path);

  while (current) {
    trail.unshift(current);
    current = current.parent ? findRoute(site, current.parent) : undefined;
  }

  return trail;
}
