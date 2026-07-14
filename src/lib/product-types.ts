import type { ComponentType, ReactNode } from "react";

export type CTA = {
  label: string;
  href: string;
  icon?: "download" | "apple" | "external";
  /** When set, the CTA renders as a button that runs this action instead of a link. */
  action?: "download-biobiz";
};

export type Product = {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  ctas: CTA[];
  image?: string;
  reverse?: boolean;
  icon?: ComponentType<{ className?: string }>;
  accent: "red" | "gold";
  extra?: ReactNode;
  /** Optional product brand logo. If `logoMark` is supplied (URL/import) it renders
   * as an image; otherwise `logoLetter` renders a gradient placeholder square. */
  logoMark?: string;
  logoLetter?: string;
  /** On mobile, place the product image beside the text (2-col) instead of stacked. */
  mobileInlineImage?: boolean;
  /** Hide the product hero image on mobile (e.g. when the extra block already shows it). */
  hideImageOnMobile?: boolean;
};
