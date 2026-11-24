// Share messages and network share URLs for the ambassador Links screen.
// Pure functions, so tests/partners-share.test.mjs can check them in Node.

export type Network = "whatsapp" | "facebook" | "telegram" | "x" | "instagram";
export const NETWORKS: Network[] = ["whatsapp", "facebook", "telegram", "x", "instagram"];

const DISCLOSURE = "(I'm a JOAT Global ambassador and may earn a commission.)";

// The editable wording. {url} and {CODE} are filled in by shareMessage/codeMessage.
// Only programmes listed here with a `code` line accept ambassador codes
// (website box + shop cart); the others share links only.
export const MESSAGES: Record<string, { link: string; code?: string }> = {
  amare: {
    link: [
      "Discover Amare's Big Planet, songs, videos and the ABC tracing app for kids, plus their shop 🪐 {url}",
      "Shopping on their store? Use my ambassador code {CODE} on the website or in the cart.",
      DISCLOSURE,
    ].join("\n"),
    code: "Use my code {CODE} when you shop at Amare's Big Planet, amaresbigplanet.com",
  },
  joat: {
    link: ["Need a website, marketing or digital help? Talk to JOAT Global {url}", DISCLOSURE].join(
      "\n",
    ),
  },
};

export const acceptsCodes = (programId: string) => !!MESSAGES[programId]?.code;

const fill = (tpl: string, url: string, code: string) =>
  tpl.replaceAll("{url}", url).replaceAll("{CODE}", code);

export const shareMessage = (programId: string, url: string, code: string) =>
  fill(MESSAGES[programId]?.link ?? "{url}\n" + DISCLOSURE, url, code);

export const codeMessage = (programId: string, code: string) =>
  fill(MESSAGES[programId]?.code ?? "", "", code);

/** Adds utm_source/utm_medium for the network; ref and ln are left alone. */
export function withUtm(url: string, network: Network | "native") {
  const u = new URL(url);
  u.searchParams.set("utm_source", network === "native" ? "share" : network);
  u.searchParams.set("utm_medium", "ambassador");
  return u.toString();
}

/**
 * Where each network button goes. `copy` is put on the clipboard first for
 * networks that drop prefilled text (Facebook) or have no web share URL
 * (Instagram); `toast` tells the ambassador to paste it.
 */
export function networkShare(network: Network, message: string, url: string) {
  const e = encodeURIComponent;
  switch (network) {
    case "whatsapp":
      return { href: `https://wa.me/?text=${e(message)}` };
    case "facebook":
      return {
        href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
        copy: message,
        toast: "Message copied, paste it into your post",
      };
    case "telegram":
      return {
        href: `https://t.me/share/url?url=${e(url)}&text=${e(message.replace(url, "").trim())}`,
      };
    case "x":
      return {
        href: `https://twitter.com/intent/tweet?text=${e(message.replace(url, "").trim())}&url=${e(url)}`,
      };
    case "instagram":
      return {
        href: "https://www.instagram.com/",
        copy: message,
        toast: "Copied, paste it into your Instagram bio, story link sticker or DM",
      };
  }
}

export const NETWORK_LABEL: Record<Network, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  telegram: "Telegram",
  x: "X",
  instagram: "Instagram",
};
