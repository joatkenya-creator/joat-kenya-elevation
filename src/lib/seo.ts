const SITE_URL = "https://joatkenya.com";
const SITE_NAME = "J.O.A.T. Kenya";
const DEFAULT_IMAGE = `${SITE_URL}/joat-logo.png`;

type SeoConfig = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
};

export function seo({ title, description, path = "/", image = DEFAULT_IMAGE, noindex }: SeoConfig) {
  const url = new URL(path, SITE_URL).toString();

  return {
    links: [{ rel: "canonical", href: url }],
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "keywords",
        content:
          "JOAT Kenya, J.O.A.T. Kenya, elite virtual assistants, virtual assistant services, AI automation, lead generation, real estate virtual assistant, software development, mobile app development, web development, digital marketing, AI solutions, media production, animation studio, children's digital education, BioBiz, Majobo Kenya",
      },
      { name: "author", content: "J.O.A.T. Kenya" },
      { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:image", content: image },
      { property: "og:locale", content: "en_KE" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "J.O.A.T. Kenya",
  alternateName: ["JOAT Kenya", "JOAT", "Jack of All Trades Kenya"],
  legalName: "Jack Urban Services Ltd",
  url: SITE_URL,
  logo: DEFAULT_IMAGE,
  image: DEFAULT_IMAGE,
  email: "joatkenya120@gmail.com",
  telephone: "+254142378150",
  slogan:
    "Elite virtual assistants, AI automation and lead generation. Built in-house. Delivered worldwide.",
  description:
    "An elite virtual assistant, AI automation and lead-generation partner, backed by in-house software development, media production and children's digital education capabilities for clients worldwide.",
  foundingLocation: {
    "@type": "Place",
    name: "Kiambu, Kenya",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kiambu",
      addressCountry: "KE",
    },
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "The Brick Mall, 2nd Floor, Kiambu Road, Thindigua",
    addressLocality: "Kiambu",
    addressCountry: "KE",
  },
  areaServed: "Worldwide",
  knowsLanguage: ["en", "sw"],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "joatkenya120@gmail.com",
      telephone: "+254142378150",
      areaServed: "Worldwide",
      availableLanguage: ["English", "Swahili"],
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "joatkenya120@gmail.com",
      url: `${SITE_URL}/contact`,
      areaServed: "Worldwide",
      availableLanguage: ["English", "Swahili"],
    },
  ],
  sameAs: [
    "https://www.linkedin.com/company/joat-kenya-jack-urban-services-ltd/",
    "https://www.instagram.com/joat.kenya",
    "https://www.facebook.com/profile.php?id=61581326003888",
    "https://www.youtube.com/results?search_query=joat+kenya",
    "https://www.majobokenya.com/",
    "https://biobiz.app",
  ],
  subjectOf: [
    { "@type": "CreativeWork", name: "LLM index", url: `${SITE_URL}/llms.txt` },
    { "@type": "CreativeWork", name: "Full knowledge file", url: `${SITE_URL}/llms-full.txt` },
  ],
  knowsAbout: [
    "Virtual assistant services",
    "AI automation",
    "Lead generation",
    "Software development",
    "Mobile app development",
    "Web development",
    "Digital marketing",
    "Media and content production",
    "Animation and 3D",
    "AI solutions",
    "Children's digital education",
  ],
};

/**
 * WebSite JSON-LD with SearchAction — unlocks the Google "sitelinks search
 * box" (a search input under the joatkenya.com result in SERPs). Even though
 * we don't have a search route yet, the `?q=` template gives Google enough.
 */
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "J.O.A.T. Kenya",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/**
 * AggregateRating + Review JSON-LD built from the testimonials table. Gives
 * Google's rich-result engine the data it needs to show a star rating beside
 * a JOAT search result. Pass the testimonials array from your DB or fallback.
 */
export function aggregateRatingJsonLd(
  reviews: Array<{ author_name: string; quote: string; rating?: number | null }>,
) {
  if (!reviews || reviews.length === 0) return null;
  const ratings = reviews
    .map((r) => (typeof r.rating === "number" ? r.rating : 5))
    .filter((n) => n >= 1 && n <= 5);
  const avg = ratings.length === 0 ? 5 : ratings.reduce((s, n) => s + n, 0) / ratings.length;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "J.O.A.T. Kenya",
    url: SITE_URL,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: typeof r.rating === "number" ? r.rating : 5,
        bestRating: 5,
        worstRating: 1,
      },
      author: { "@type": "Person", name: r.author_name },
      reviewBody: r.quote,
    })),
  };
}

/**
 * Build a BreadcrumbList JSON-LD payload for a sub-page. Search engines use it
 * to render breadcrumb trails under your result in the SERP.
 */
export function breadcrumbJsonLd(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: `${SITE_URL}${path}`,
      },
    ],
  };
}

/**
 * Catalog of our services + products as schema.org "Service" entries — gives
 * Google a structured view of what JOAT actually offers. Ordered to lead with
 * the core positioning (Virtual Assistants, AI & Automation, Marketing & Lead
 * Generation); Software Development, Media and Children's Education are
 * supporting in-house capabilities, listed after.
 */
export const servicesCatalogJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "J.O.A.T. Kenya: Services & Products",
  itemListElement: [
    {
      "@type": "Service",
      position: 1,
      name: "Virtual Assistants",
      description:
        "Elite AI-run and human virtual assistants for lead response, CRM and operations, starting with real estate.",
      provider: { "@type": "Organization", name: "J.O.A.T. Kenya", url: SITE_URL },
      areaServed: "Worldwide",
    },
    {
      "@type": "Service",
      position: 2,
      name: "AI & Automation",
      description:
        "Claude/OpenRouter integrations, chatbots, meeting summaries, live translation and agentic workflow automation.",
      provider: { "@type": "Organization", name: "J.O.A.T. Kenya", url: SITE_URL },
      areaServed: "Worldwide",
    },
    {
      "@type": "Service",
      position: 3,
      name: "Marketing & Lead Generation",
      description:
        "Generative campaigns, outbound systems and paid ads across IG, TikTok, LinkedIn and Facebook, engineered for qualified leads.",
      provider: { "@type": "Organization", name: "J.O.A.T. Kenya", url: SITE_URL },
      areaServed: "Worldwide",
    },
    {
      "@type": "Service",
      position: 4,
      name: "Software Development",
      description:
        "Custom mobile apps, websites and AI-integrated products, designed, built and delivered end-to-end.",
      provider: { "@type": "Organization", name: "J.O.A.T. Kenya", url: SITE_URL },
      areaServed: "Worldwide",
    },
    {
      "@type": "Service",
      position: 5,
      name: "Media & Content Production",
      description:
        "Animation, video and 3D in Blender: film-quality work for products, classrooms and brands.",
      provider: { "@type": "Organization", name: "J.O.A.T. Kenya", url: SITE_URL },
      areaServed: "Worldwide",
    },
    {
      "@type": "Service",
      position: 6,
      name: "Children's Digital Education",
      description:
        "Curriculum-aligned animated content, learning games and interactive activities for ages 1–8.",
      provider: { "@type": "Organization", name: "J.O.A.T. Kenya", url: SITE_URL },
      areaServed: "Worldwide",
    },
    {
      "@type": "Service",
      position: 7,
      name: "Real Estate Virtual Assistant",
      description:
        "AI Inside Sales Agent (ISA) for sub-5-minute lead response, or a dedicated human VA for MLS, CRM and transaction coordination.",
      provider: { "@type": "Organization", name: "J.O.A.T. Kenya", url: SITE_URL },
      areaServed: "Worldwide",
      url: `${SITE_URL}/real-estate-virtual-assistant`,
    },
    {
      "@type": "SoftwareApplication",
      position: 8,
      name: "BioBiz",
      description:
        "Digital business-card app with AI meeting notes and live foreign-language to English transcription.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "iOS, Android",
      url: "https://biobiz.app",
    },
    {
      "@type": "WebSite",
      position: 9,
      name: "Majobo Kenya",
      description: "Jobs marketplace with 1,000+ AI-classified listings.",
      url: "https://www.majobokenya.com/",
    },
  ],
};

/**
 * Build an FAQPage JSON-LD payload from an array of Q/A pairs.
 */
export function faqPageJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
      },
    })),
  };
}

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "J.O.A.T. Kenya",
  url: SITE_URL,
  image: DEFAULT_IMAGE,
  email: "joatkenya120@gmail.com",
  telephone: "+254142378150",
  description:
    "An elite virtual assistant, AI automation and lead-generation partner, backed by in-house software development, media production and children's digital education capabilities for clients worldwide.",
  priceRange: "$$",
  areaServed: "Worldwide",
  address: {
    "@type": "PostalAddress",
    streetAddress: "The Brick Mall, 2nd Floor, Kiambu Road, Thindigua",
    addressLocality: "Kiambu",
    addressCountry: "KE",
  },
  serviceType: [
    "Virtual assistant services",
    "AI automation",
    "Lead generation",
    "Software development",
    "Mobile app development",
    "Web development",
    "Digital marketing",
    "Media and content production",
    "Animation and 3D",
    "AI solutions",
    "Children's digital education",
  ],
};
