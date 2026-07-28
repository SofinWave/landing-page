import { LocaleSupport, SiteId } from "@/enums";
import { HOME_PATH } from "@/lib/routes";
import { DEFAULT_SITE, siteConfig } from "@/lib/sites";

/**
 * Protocol used to build absolute URLs. Override with NEXT_PUBLIC_SITE_PROTOCOL
 * for a non-TLS preview environment.
 */
const PROTOCOL = process.env.NEXT_PUBLIC_SITE_PROTOCOL ?? "https";

/**
 * Canonical URL of the apex site.
 *
 * Kept for the tech site's existing callers; per-site URLs come from
 * {@link siteUrl}, which reads the hostname out of the site registry.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? `${PROTOCOL}://${DEFAULT_SITE.host}`
).replace(/\/$/, "");

export const SITE_NAME = DEFAULT_SITE.name;

/** Absolute origin for a site, e.g. `https://media.sofinwave.com`. */
export function siteUrl(site: SiteId): string {
  if (site === DEFAULT_SITE.id) return SITE_URL;
  return `${PROTOCOL}://${siteConfig(site).host}`;
}

/** BCP-47 tags used for Open Graph locale + hreflang. */
export const OG_LOCALE: Record<string, string> = {
  [LocaleSupport.EN]: "en_US",
  [LocaleSupport.VI]: "vi_VN",
  [LocaleSupport.ZH]: "zh_CN",
};

/**
 * Keywords for `<meta name="keywords">` and GEO context, per site and locale.
 *
 * Scoped by site for the same reason the sites are separate at all: a finance
 * page advertising "data annotation outsourcing" misdescribes the entity to
 * answer engines, and the finance vertical is YMYL — borrowing the software
 * business's terms is exactly the contamination the split exists to prevent.
 */
export const SITE_KEYWORDS: Record<SiteId, Record<string, string[]>> = {
  [SiteId.Tech]: {
    [LocaleSupport.EN]: [
      "software outsourcing Vietnam",
      "offshore software development",
      "AI implementation consulting",
      "LLM integration services",
      "dedicated development team",
      "IT staff augmentation",
      "custom software development",
      "hire developers Vietnam",
      "software outsourcing company",
      "system integration",
      "DevOps outsourcing",
      "AI training data services",
      "data annotation outsourcing",
      "egocentric data collection",
      "video annotation services",
      "3D point cloud annotation",
      "RLHF and SFT data",
      "Next.js",
      "TypeScript",
    ],
    [LocaleSupport.VI]: [
      "thuê ngoài phát triển phần mềm",
      "gia công phần mềm",
      "triển khai hệ thống AI",
      "tích hợp LLM",
      "công ty gia công phần mềm",
      "thuê đội ngũ lập trình",
      "phát triển phần mềm theo yêu cầu",
      "tăng cường nhân sự IT",
      "tích hợp hệ thống",
      "DevOps",
      "dịch vụ gán nhãn dữ liệu",
      "thu thập dữ liệu huấn luyện AI",
      "gán nhãn hình ảnh và video",
      "thu thập dữ liệu góc nhìn thứ nhất",
      "gán nhãn point cloud 3D",
      "dữ liệu RLHF và SFT",
      "Next.js",
      "TypeScript",
    ],
    [LocaleSupport.ZH]: [
      "越南软件外包",
      "离岸软件开发",
      "软件外包公司",
      "AI 落地咨询",
      "大模型集成服务",
      "定制软件开发",
      "专属开发团队",
      "IT 人力外包",
      "系统集成",
      "DevOps 外包",
      "AI 训练数据服务",
      "数据标注外包",
      "第一人称视角数据采集",
      "视频标注服务",
      "3D 点云标注",
      "RLHF 与 SFT 数据",
      "Next.js",
      "TypeScript",
    ],
  },
  [SiteId.Media]: {
    [LocaleSupport.EN]: [
      "product video production",
      "software explainer video",
      "technical content writing",
      "developer marketing content",
      "video production Vietnam",
      "affiliate content",
    ],
    [LocaleSupport.VI]: [
      "sản xuất video sản phẩm",
      "video giới thiệu phần mềm",
      "viết nội dung kỹ thuật",
      "nội dung marketing cho sản phẩm công nghệ",
      "sản xuất video Việt Nam",
      "tiếp thị liên kết",
    ],
    [LocaleSupport.ZH]: [
      "产品视频制作",
      "软件演示视频",
      "技术内容写作",
      "开发者营销内容",
      "越南视频制作",
      "联盟营销内容",
    ],
  },
  // Deliberately free of advisory vocabulary. This site publishes a record of a
  // process and the tools behind it; it holds no licence, so terms implying
  // advice or portfolio management would misstate what is on offer.
  [SiteId.Finance]: {
    [LocaleSupport.EN]: [
      "investing notes",
      "investing process",
      "portfolio tracking tools",
      "financial literacy",
      "market data analysis",
      "personal finance tooling",
    ],
    [LocaleSupport.VI]: [
      "ghi chép đầu tư",
      "quy trình đầu tư",
      "công cụ theo dõi danh mục",
      "kiến thức tài chính",
      "phân tích dữ liệu thị trường",
      "công cụ tài chính cá nhân",
    ],
    // Same constraint as the other locales: nothing here may read as advice,
    // stock picking, or asset management (投资建议 / 荐股 / 理财顾问).
    [LocaleSupport.ZH]: [
      "投资笔记",
      "投资流程",
      "投资组合跟踪工具",
      "金融知识",
      "市场数据分析",
      "个人财务工具",
    ],
  },
  [SiteId.Academy]: {
    [LocaleSupport.EN]: [
      "software engineering courses",
      "AI and programming training",
      "investing literacy course",
      "content production course",
      "school tutoring grades 1-12",
      "online learning Vietnam",
    ],
    [LocaleSupport.VI]: [
      "khóa học kỹ thuật phần mềm",
      "đào tạo lập trình và AI",
      "khóa học kiến thức đầu tư",
      "khóa học sản xuất nội dung",
      "gia sư lớp 1 đến 12",
      "học trực tuyến",
    ],
    [LocaleSupport.ZH]: [
      "软件工程课程",
      "编程与 AI 培训",
      "投资知识课程",
      "内容制作课程",
      "中小学 1-12 年级辅导",
      "越南在线学习",
    ],
  },
};

/**
 * Keywords for a site in a locale, falling back to English when the locale has
 * no list of its own.
 */
export function siteKeywords(locale: string, site: SiteId = DEFAULT_SITE.id): string[] {
  const bySite = SITE_KEYWORDS[site];
  return bySite[locale] ?? bySite[LocaleSupport.EN];
}

/** Social / canonical profiles surfaced in structured data (sameAs). */
export const SITE_SAME_AS: string[] = ["https://github.com/SofinWave"];

export const SITE_EMAIL = "Work.KingNNT@gmail.com";

/**
 * Absolute URL for a locale-prefixed path on a site.
 *
 * `path` is the segment after the locale, without leading or trailing slashes.
 * Omitting it yields the locale root, which only ever redirects — link to a real
 * page rather than relying on that hop.
 */
export function pageUrl(locale: string, path = "", site: SiteId = DEFAULT_SITE.id): string {
  const origin = siteUrl(site);
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `${origin}/${locale}/${clean}` : `${origin}/${locale}`;
}

/** Absolute URL for a site's landing page. */
export function localeUrl(locale: string, site: SiteId = DEFAULT_SITE.id): string {
  return pageUrl(locale, HOME_PATH, site);
}

/** hreflang alternates map (locale -> absolute URL) for a given path. */
export function languageAlternates(
  locales: readonly string[],
  path: string = HOME_PATH,
  site: SiteId = DEFAULT_SITE.id,
): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, pageUrl(l, path, site)]));
}
