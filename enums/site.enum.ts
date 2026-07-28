/**
 * The four business verticals, each served on its own hostname.
 *
 * They are deliberately separate sites rather than sections of one: a single
 * domain covering software consulting, media, investing, and education would
 * dilute topical authority in all four, and the finance vertical is YMYL —
 * isolating it keeps its trust requirements away from the software business
 * that pays the bills.
 */
export enum SiteId {
  /** sofinwave.org — IT consulting and system implementation, including AI. */
  Tech = "tech",
  /** media.sofinwave.org — video production, content, affiliate. */
  Media = "media",
  /** finance.sofinwave.org — investing knowledge and tooling. YMYL. */
  Finance = "finance",
  /** academy.sofinwave.org — technical, investing, content, and K-12 education. */
  Academy = "academy",
}
