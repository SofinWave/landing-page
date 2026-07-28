/**
 * Single source of truth for every public route.
 *
 * Navigation, the sitemap, breadcrumbs, and the generated llms.txt all read from
 * this registry, so they cannot drift apart. Adding a page means adding an entry
 * here plus its copy under the `pages` namespace in both message catalogs.
 */

export type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";

export interface RouteDef {
  /** Path after the locale prefix, without leading or trailing slashes. */
  path: string;
  /** Key under the `pages` message namespace holding this route's copy. */
  key: string;
  /** Parent route path, used to build breadcrumb trails. */
  parent?: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

/** The landing page. Kept at `/{locale}/home`; `/{locale}` redirects here. */
export const HOME_PATH = "home";

export const ROUTES: readonly RouteDef[] = [
  { path: HOME_PATH, key: "home", priority: 1, changeFrequency: "monthly" },

  {
    path: "vietnam-software-outsourcing",
    key: "vietnamSoftwareOutsourcing",
    parent: HOME_PATH,
    priority: 0.9,
    changeFrequency: "monthly",
  },

  {
    path: "services",
    key: "services",
    parent: HOME_PATH,
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "services/offshore-development",
    key: "offshoreDevelopment",
    parent: "services",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "services/dedicated-team",
    key: "dedicatedTeam",
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
    path: "services/custom-software-development",
    key: "customSoftwareDevelopment",
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
] as const;

/** Every route except the landing page — i.e. those rendered by the content shell. */
export const CONTENT_ROUTES = ROUTES.filter((r) => r.path !== HOME_PATH);

export function findRoute(path: string): RouteDef | undefined {
  return ROUTES.find((r) => r.path === path);
}

/**
 * Breadcrumb trail for a route, ordered root-first and including the route
 * itself. Returns just the route when it has no parent chain.
 */
export function breadcrumbTrail(path: string): RouteDef[] {
  const trail: RouteDef[] = [];
  let current = findRoute(path);

  while (current) {
    trail.unshift(current);
    current = current.parent ? findRoute(current.parent) : undefined;
  }

  return trail;
}
