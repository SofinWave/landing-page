import { SiteId } from "@/enums";
import { type RouteDef, routesFor } from "@/lib/routes";

/**
 * Per-site configuration. One Next.js app serves all four hostnames — the
 * deployment target is a single Raspberry Pi behind Caddy, so four separate
 * Node processes would cost far more than a hostname lookup.
 */
/** A link in the header or footer, resolved against the site's content namespace. */
export interface NavLink {
  href: string;
  /** Key under the site's content namespace; its `title`/`navLabel` supplies the label. */
  key: string;
}

export interface SiteConfig {
  id: SiteId;
  /** Production hostname, without protocol. */
  host: string;
  /** Brand name used in titles, schema, and the footer. */
  name: string;
  /** Message namespace holding this site's metadata (title, description, og). */
  metaNamespace: string;
  /** Message namespace holding this site's `pages` content. */
  contentNamespace: string;
  /** schema.org type for this site's Organization node. */
  schemaType: string;
  routes: readonly RouteDef[];
  /** Primary header navigation. */
  nav: readonly NavLink[];
  /** Footer column of service/offering links. Empty hides the column. */
  footerServices: readonly NavLink[];
  /** Footer column of company links. */
  footerCompany: readonly NavLink[];
}

const APEX = "sofinwave.com";

export const SITES: Record<SiteId, SiteConfig> = {
  [SiteId.Tech]: {
    id: SiteId.Tech,
    host: APEX,
    name: "SofinWave",
    metaNamespace: "metadata",
    contentNamespace: "pages",
    schemaType: "ProfessionalService",
    routes: routesFor(SiteId.Tech),
    // Advice first, then the AI work, then the team that executes it. The order
    // is the positioning: a visitor should meet the consultancy before the
    // delivery capacity, not the other way round.
    nav: [
      { href: "/services/it-consulting", key: "itConsulting" },
      { href: "/services/ai-implementation", key: "aiImplementation" },
      { href: "/services/delivery-teams", key: "deliveryTeams" },
      { href: "/vietnam-it-consulting", key: "vietnamItConsulting" },
      { href: "/services", key: "services" },
    ],
    footerServices: [
      { href: "/services/it-consulting", key: "itConsulting" },
      { href: "/services/ai-implementation", key: "aiImplementation" },
      { href: "/services/ai-agents", key: "aiAgents" },
      { href: "/services/delivery-teams", key: "deliveryTeams" },
      { href: "/services/ai-training-data", key: "aiTrainingData" },
    ],
    footerCompany: [
      { href: "/vietnam-it-consulting", key: "vietnamItConsulting" },
      { href: "/engagement-models", key: "engagementModels" },
      { href: "/products", key: "products" },
      { href: "/ventures", key: "ventures" },
      { href: "/about", key: "about" },
      { href: "/contact", key: "contact" },
    ],
  },
  [SiteId.Media]: {
    id: SiteId.Media,
    host: `media.${APEX}`,
    name: "SofinWave Media",
    metaNamespace: "mediaMetadata",
    contentNamespace: "mediaPages",
    schemaType: "Organization",
    routes: routesFor(SiteId.Media),
    nav: [{ href: "/about", key: "about" }],
    footerServices: [],
    footerCompany: [
      { href: "/about", key: "about" },
      { href: "/contact", key: "contact" },
    ],
  },
  [SiteId.Finance]: {
    id: SiteId.Finance,
    host: `finance.${APEX}`,
    name: "SofinWave Finance",
    metaNamespace: "financeMetadata",
    contentNamespace: "financePages",
    // Deliberately not FinancialService: that type describes a regulated
    // provider, and this site publishes knowledge and tooling rather than
    // offering advice. See docs/CONTENT-TODO.md.
    schemaType: "Organization",
    routes: routesFor(SiteId.Finance),
    nav: [
      { href: "/about", key: "about" },
      { href: "/disclaimer", key: "disclaimer" },
    ],
    footerServices: [],
    footerCompany: [
      { href: "/about", key: "about" },
      { href: "/contact", key: "contact" },
      { href: "/disclaimer", key: "disclaimer" },
    ],
  },
  [SiteId.Academy]: {
    id: SiteId.Academy,
    host: `academy.${APEX}`,
    name: "SofinWave Academy",
    metaNamespace: "academyMetadata",
    contentNamespace: "academyPages",
    schemaType: "EducationalOrganization",
    routes: routesFor(SiteId.Academy),
    nav: [{ href: "/about", key: "about" }],
    footerServices: [],
    footerCompany: [
      { href: "/about", key: "about" },
      { href: "/contact", key: "contact" },
    ],
  },
};

export const ALL_SITES = Object.values(SITES);

export const DEFAULT_SITE = SITES[SiteId.Tech];

export function siteConfig(id: SiteId): SiteConfig {
  return SITES[id];
}

/**
 * The other three sites, in registry order.
 *
 * Backs the ecosystem links in the footer and on the tech landing page. The
 * sites are separate hostnames so each vertical is judged on its own content,
 * but nothing about that split requires them to be unreachable from one
 * another — without these links a crawler landing on one site has no path to
 * the rest, and the four hostnames read as unrelated entities.
 */
export function siblingSites(site: SiteId): SiteConfig[] {
  return ALL_SITES.filter((candidate) => candidate.id !== site);
}

export function isSiteId(value: string): value is SiteId {
  return Object.values(SiteId).includes(value as SiteId);
}

/**
 * Map an incoming `Host` header to a site.
 *
 * Matches the production hostname and any subdomain-prefixed local equivalent
 * (`media.localhost:3000`), falling back to the tech site. Port and case are
 * ignored; an unknown host serves the apex rather than a 404, so a misconfigured
 * DNS record degrades to the main site instead of taking everything down.
 */
export function resolveSite(host: string | null | undefined): SiteConfig {
  if (!host) return DEFAULT_SITE;

  const hostname = host
    .split(":")[0]
    .toLowerCase()
    .replace(/^www\./, "");

  const exact = ALL_SITES.find((site) => site.host === hostname);
  if (exact) return exact;

  // Local and preview hosts: match on the leading label, e.g. `media.localhost`
  // or `media.sofinwave.pages.dev`.
  const label = hostname.split(".")[0];
  const byLabel = ALL_SITES.find((site) => site.id === label);
  if (byLabel) return byLabel;

  return DEFAULT_SITE;
}
