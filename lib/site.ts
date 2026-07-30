import { LocaleSupport, SiteId } from "@/enums";
import { HOME_PATH } from "@/lib/routes";
import { ALL_SITES, DEFAULT_SITE, siteConfig } from "@/lib/sites";

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
    // Advisory terms lead. The staffing vocabulary this list used to open with
    // ("hire developers", "software outsourcing company") described what the
    // delivery team sells, not what the business is, and it set the wrong
    // expectation before a visitor reached the site.
    [LocaleSupport.EN]: [
      "IT consulting",
      "technology consulting",
      "software consulting",
      "solution architecture",
      "AI consulting",
      "AI strategy consulting",
      "agentic AI consulting",
      "AI integration for automation",
      "technical due diligence",
      "system integration consulting",
      "legacy system modernisation",
      "AI implementation consulting",
      "LLM integration services",
      "AI training data services",
      "data annotation services",
      "egocentric data collection",
      "RLHF and SFT data",
      "Next.js",
      "TypeScript",
    ],
    [LocaleSupport.VI]: [
      "tư vấn công nghệ thông tin",
      "tư vấn giải pháp phần mềm",
      "tư vấn kiến trúc hệ thống",
      "tư vấn chuyển đổi số",
      "tư vấn AI",
      "tư vấn chiến lược AI",
      "tư vấn AI agent",
      "tích hợp AI tự động hoá quy trình",
      "thẩm định kỹ thuật",
      "tư vấn tích hợp hệ thống",
      "hiện đại hoá hệ thống cũ",
      "triển khai hệ thống AI",
      "tích hợp LLM",
      "dịch vụ gán nhãn dữ liệu",
      "thu thập dữ liệu huấn luyện AI",
      "thu thập dữ liệu góc nhìn thứ nhất",
      "dữ liệu RLHF và SFT",
      "Next.js",
      "TypeScript",
    ],
    [LocaleSupport.ZH]: [
      "IT 咨询",
      "技术咨询",
      "软件咨询",
      "解决方案架构",
      "AI 咨询",
      "AI 战略咨询",
      "AI 智能体咨询",
      "AI 集成与流程自动化",
      "技术尽职调查",
      "系统集成咨询",
      "遗留系统现代化改造",
      "AI 落地咨询",
      "大模型集成服务",
      "AI 训练数据服务",
      "数据标注服务",
      "第一人称视角数据采集",
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

/**
 * Keywords for individual pages, keyed by route key.
 *
 * The site-level list is emitted from the root layout, which means it lands on
 * every page: the data annotation page was describing itself with the same
 * consulting terms as the home page and said nothing about annotation. These
 * *replace* the site list rather than extending it, because a page that opens
 * with the umbrella vocabulary buries the terms it actually competes on.
 *
 * Only pages whose subject differs sharply from the site's overall positioning
 * need an entry. Everything else inherits, which is the correct default.
 */
export const PAGE_KEYWORDS: Partial<Record<SiteId, Record<string, Record<string, string[]>>>> = {
  [SiteId.Tech]: {
    aiTrainingData: {
      [LocaleSupport.EN]: [
        "AI training data services",
        "training data provider",
        "data collection and annotation",
        "LLM training data",
        "post-training data",
        "machine learning data services",
        "human-in-the-loop data",
        "data labelling company",
      ],
      [LocaleSupport.VI]: [
        "dịch vụ dữ liệu huấn luyện AI",
        "nhà cung cấp dữ liệu huấn luyện",
        "thu thập và gán nhãn dữ liệu",
        "dữ liệu huấn luyện LLM",
        "dữ liệu hậu huấn luyện",
        "công ty gán nhãn dữ liệu",
      ],
      [LocaleSupport.ZH]: [
        "AI 训练数据服务",
        "训练数据供应商",
        "数据采集与标注",
        "大模型训练数据",
        "后训练数据",
        "数据标注公司",
        "数据标注外包",
        "数据众包",
      ],
    },
    dataCollection: {
      [LocaleSupport.EN]: [
        "AI data collection services",
        "video data collection",
        "image data collection",
        "speech data collection",
        "audio data collection",
        "document data collection",
        "scripted scenario data",
        "consented data collection",
        "Southeast Asia data collection",
      ],
      [LocaleSupport.VI]: [
        "dịch vụ thu thập dữ liệu AI",
        "thu thập dữ liệu video",
        "thu thập dữ liệu hình ảnh",
        "thu thập dữ liệu giọng nói",
        "thu thập dữ liệu tài liệu",
        "dữ liệu kịch bản dàn dựng",
        "thu thập dữ liệu có đồng thuận",
      ],
      [LocaleSupport.ZH]: [
        "AI 数据采集服务",
        "视频数据采集",
        "图像数据采集",
        "语音数据采集",
        "音频数据采集",
        "文档数据采集",
        "场景数据采集",
        "定制数据采集",
        "东南亚数据采集",
        "数据合规采集",
      ],
    },
    egocentricDataCollection: {
      [LocaleSupport.EN]: [
        "egocentric data collection",
        "exocentric capture",
        "first-person video dataset",
        "embodied AI data",
        "robotics training data",
        "teleoperation data collection",
        "VLA training data",
        "multi-view synchronised capture",
      ],
      [LocaleSupport.VI]: [
        "thu thập dữ liệu góc nhìn thứ nhất",
        "quay đa góc đồng bộ",
        "dữ liệu AI hiện thân",
        "dữ liệu huấn luyện robot",
        "thu thập dữ liệu điều khiển từ xa",
        "dữ liệu huấn luyện VLA",
      ],
      [LocaleSupport.ZH]: [
        "第一人称视角数据采集",
        "第一视角数据",
        "具身智能数据采集",
        "机器人训练数据",
        "遥操作数据采集",
        "VLA 训练数据",
        "多视角同步采集",
        "人形机器人数据采集",
      ],
    },
    dataAnnotation: {
      [LocaleSupport.EN]: [
        "data annotation services",
        "data labelling services",
        "image annotation",
        "video annotation",
        "3D point cloud annotation",
        "LiDAR annotation",
        "semantic segmentation",
        "bounding box annotation",
        "keypoint annotation",
        "OCR annotation",
        "named entity recognition",
        "speaker diarisation",
      ],
      [LocaleSupport.VI]: [
        "dịch vụ gán nhãn dữ liệu",
        "gán nhãn hình ảnh",
        "gán nhãn video",
        "gán nhãn point cloud 3D",
        "gán nhãn LiDAR",
        "phân đoạn ngữ nghĩa",
        "gán nhãn bounding box",
        "gán nhãn điểm khoá",
        "gán nhãn OCR",
        "nhận dạng thực thể có tên",
      ],
      // `拉框标注` is what the Chinese annotation industry actually calls
      // bounding-box work; the textbook term alone misses the search.
      [LocaleSupport.ZH]: [
        "数据标注服务",
        "图像标注",
        "视频标注",
        "3D 点云标注",
        "激光雷达标注",
        "语义分割标注",
        "实例分割标注",
        "拉框标注",
        "关键点标注",
        "OCR 标注",
        "命名实体标注",
        "说话人分离标注",
        "自动驾驶数据标注",
      ],
    },
    rlhfSftData: {
      [LocaleSupport.EN]: [
        "RLHF data services",
        "SFT data",
        "supervised fine-tuning data",
        "preference ranking data",
        "human preference data",
        "LLM evaluation data",
        "red teaming services",
        "rubric-based evaluation",
      ],
      [LocaleSupport.VI]: [
        "dịch vụ dữ liệu RLHF",
        "dữ liệu SFT",
        "dữ liệu tinh chỉnh có giám sát",
        "dữ liệu xếp hạng ưu tiên",
        "dữ liệu phản hồi con người",
        "dữ liệu đánh giá mô hình ngôn ngữ",
        "dịch vụ red teaming",
      ],
      [LocaleSupport.ZH]: [
        "RLHF 数据服务",
        "SFT 数据",
        "监督微调数据",
        "偏好排序数据",
        "人类反馈数据",
        "大模型评测数据",
        "红队测试服务",
        "对齐数据",
        "大模型语料",
      ],
    },
  },
};

/**
 * Keywords for one page, falling back to the site list when the page has none.
 *
 * Locale falls back to English the same way `siteKeywords` does, so a page can
 * gain a locale-specific list later without a code change here.
 */
export function pageKeywords(
  locale: string,
  routeKey: string,
  site: SiteId = DEFAULT_SITE.id,
): string[] {
  const byPage = PAGE_KEYWORDS[site]?.[routeKey];
  if (!byPage) return siteKeywords(locale, site);
  return byPage[locale] ?? byPage[LocaleSupport.EN] ?? siteKeywords(locale, site);
}

/** Social / canonical profiles surfaced in structured data (sameAs). */
export const SITE_SAME_AS: string[] = ["https://github.com/SofinWave"];

export const SITE_EMAIL = "Work.KingNNT@gmail.com";

/**
 * Whether a link target is already a full URL.
 *
 * Content links are normally paths relative to their own site and get a locale
 * prefix and an origin bolted on. A cross-site link is written out in full, and
 * anything that treats it as a path produces
 * `https://sofinwave.com/enhttps://media.sofinwave.com/...`.
 */
export function isAbsoluteHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Whether a link leaves the SofinWave network entirely.
 *
 * Our four sites are one network as far as a visitor is concerned, so moving
 * between them stays in the current tab. Somewhere we do not own — one of our
 * own products on its own domain, or any third party — is a departure, and
 * opens in a new one so the visitor does not lose the page they were reading.
 *
 * A relative href is never external: it resolves against the current site.
 */
export function isExternalHref(href: string): boolean {
  if (!isAbsoluteHref(href)) return false;

  try {
    const { hostname } = new URL(href);
    return !ALL_SITES.some((site) => site.host === hostname);
  } catch {
    // Not parseable as a URL, so it is not a link off our network either.
    return false;
  }
}

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
