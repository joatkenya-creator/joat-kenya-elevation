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
          "JOAT Kenya, Kenya digital solutions, talent outsourcing Kenya, recruitment Kenya, BioBiz, Majobo Kenya, AI automation Kenya, digital education Africa, Roblox game development Kenya",
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
  alternateName: ["JOAT KENYA", "Jack of All Trades Kenya"],
  url: SITE_URL,
  logo: DEFAULT_IMAGE,
  email: "joatkenya120@gmail.com",
  telephone: "+254142378150",
  address: {
    "@type": "PostalAddress",
    streetAddress: "The Brick Mall, 2nd Floor, Kiambu Road, Thindigua",
    addressLocality: "Kiambu",
    addressCountry: "KE",
  },
  sameAs: [
    "https://twitter.com/JOATKenya",
    "https://www.youtube.com/@amaresbigplanet/featured",
    "https://www.majobokenya.com/",
  ],
  knowsAbout: [
    "Talent sourcing",
    "Staffing",
    "Software development",
    "AI automation",
    "Digital education",
    "Game development",
  ],
};

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "J.O.A.T. Kenya",
  url: SITE_URL,
  image: DEFAULT_IMAGE,
  email: "joatkenya120@gmail.com",
  telephone: "+254142378150",
  priceRange: "$$",
  areaServed: ["Kenya", "East Africa", "Africa"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "The Brick Mall, 2nd Floor, Kiambu Road, Thindigua",
    addressLocality: "Kiambu",
    addressCountry: "KE",
  },
  serviceType: [
    "Talent sourcing and headhunting",
    "Staffing and workforce solutions",
    "Executive search",
    "Software development",
    "AI marketing and automation",
    "Digital education",
  ],
};
