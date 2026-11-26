import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { friendlyError, type Program } from "./account";
import { ErrorNote, Loading, buttonClass, inputClass } from "./ui";
import { toast } from "sonner";
import { Copy, Facebook, Instagram, MessageCircle, Send, Share2, Twitter } from "lucide-react";
import {
  NETWORKS,
  NETWORK_LABEL,
  acceptsCodes,
  codeMessage,
  networkShare,
  shareMessage,
  withUtm,
  type Network,
} from "./share";

// An ambassador's referral links for one approved programme, with click
// counts. Counts are the ambassador's own rows (RLS), duplicates excluded.

type LinkRow = {
  id: string;
  code: string;
  program_id: string;
  destination_path: string;
  destination_host: "site" | "shop";
  campaign: string | null;
  status: "active" | "disabled";
};
type ClickRow = { link_id: string | null; program_id: string; at: string };

const DAYS = 30;

function useMyLinks(userId: string) {
  return useQuery({
    queryKey: ["links", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("id, code, program_id, destination_path, destination_host, campaign, status")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LinkRow[];
    },
  });
}

function useMyClicks(userId: string) {
  return useQuery({
    queryKey: ["clicks", userId],
    queryFn: async () => {
      // ponytail: fetches each click row; switch to a SQL count view past ~10k clicks per ambassador.
      const since = new Date(Date.now() - DAYS * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("affiliate_clicks")
        .select("link_id, program_id, at")
        .eq("profile_id", userId)
        .eq("is_duplicate", false)
        .gte("at", since);
      if (error) throw error;
      return data as ClickRow[];
    },
  });
}

function referralUrl(program: Program, publicCode: string, link?: LinkRow) {
  const base =
    link?.destination_host === "shop" && program.shop_url ? program.shop_url : program.site_url!;
  const url = new URL(link ? link.destination_path : "/", base);
  url.searchParams.set("ref", publicCode);
  if (link) url.searchParams.set("ln", link.code);
  return url.toString();
}

const linkLabel = (program: Program, l: LinkRow) =>
  `${l.destination_host === "shop" ? `${program.name} shop ` : ""}${l.destination_path}${l.campaign ? ` · ${l.campaign}` : ""}`;

export function ProgrammeLinks(props: { userId: string; publicCode: string; program: Program }) {
  const { program } = props;
  const links = useMyLinks(props.userId);
  const clicks = useMyClicks(props.userId);

  if (!program.site_url) return null;
  if (links.isLoading || clicks.isLoading) return <Loading label="Loading your links" />;
  if (links.error || clicks.error)
    return <ErrorNote>We couldn't load your links. Refresh to try again.</ErrorNote>;

  const mine = links.data!.filter((l) => l.program_id === program.id);
  const clickCount = (linkId: string | null) =>
    clicks.data!.filter((c) => c.program_id === program.id && c.link_id === linkId).length;
  const total = clicks.data!.filter((c) => c.program_id === program.id).length;

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-gilda text-[24px] font-normal text-joat-cream">
          Your {program.name} links
        </h3>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "click" : "clicks"} in the last {DAYS} days
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Always say you're a JOAT Global ambassador and may earn a commission, right next to the
        link. A visit is credited to you for {program.attribution_window_days} days; if the visitor
        later clicks another ambassador's link, the newer link gets the credit.
      </p>

      {acceptsCodes(program.id) && (
        <CodeCard
          programId={program.id}
          code={props.publicCode}
          siteUrl={program.site_url}
          discountPercent={program.ambassador_discount_percent}
        />
      )}

      <ul className="divide-y divide-border rounded-[12px] border border-border bg-joat-black">
        <LinkItem
          label="Home page"
          url={referralUrl(program, props.publicCode)}
          clicks={clickCount(null)}
          programId={program.id}
          code={props.publicCode}
        />
        {mine.map((l) => (
          <LinkItem
            key={l.id}
            label={linkLabel(program, l)}
            url={referralUrl(program, props.publicCode, l)}
            clicks={clickCount(l.id)}
            disabled={l.status === "disabled"}
            programId={program.id}
            code={props.publicCode}
          />
        ))}
      </ul>

      <NewLink program={program} userId={props.userId} />
    </section>
  );
}

function LinkItem(props: {
  label: string;
  url: string;
  clicks: number;
  disabled?: boolean;
  programId: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(props.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="min-w-0">
        <p className="break-all text-sm font-medium">
          {props.label}
          {props.disabled && (
            <span className="ml-2 rounded-full border border-joat-error text-joat-cream px-2 py-0.5 text-xs">
              Disabled by the partner team
            </span>
          )}
        </p>
        <p className="break-all font-mono text-xs text-muted-foreground">{props.url}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm tabular-nums text-muted-foreground">{props.clicks} clicks</span>
        {!props.disabled && (
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] bg-joat-gold px-4 py-2 text-sm font-medium text-joat-black transition-colors hover:bg-joat-gold-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-joat-gold"
            aria-live="polite"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? "Copied" : "Copy link"}
          </button>
        )}
      </div>
      {!props.disabled && (
        <ShareControl
          url={props.url}
          message={(u) => shareMessage(props.programId, u, props.code)}
        />
      )}
    </li>
  );
}

function NewLink(props: { program: Program; userId: string }) {
  const { program } = props;
  const queryClient = useQueryClient();
  const [destination, setDestination] = useState("");
  const [campaign, setCampaign] = useState("");
  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("create_partner_link", {
        p_program_id: program.id,
        p_destination: destination,
        p_campaign: campaign || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDestination("");
      setCampaign("");
      return queryClient.invalidateQueries({ queryKey: ["links", props.userId] });
    },
  });
  const destId = `dest-${program.id}`;
  const campId = `camp-${program.id}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate();
      }}
      className="space-y-3 border-t border-border pt-4"
    >
      <p className="text-sm font-medium">Link to a specific page</p>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <div className="space-y-1">
          <label htmlFor={destId} className="text-xs text-muted-foreground">
            Page on {new URL(program.site_url!).host}
            {program.shop_url && ` or the ${program.name} shop`}
          </label>
          <input
            id={destId}
            className={inputClass}
            placeholder={`${program.shop_url ?? program.site_url}/…`}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor={campId} className="text-xs text-muted-foreground">
            Campaign label (optional)
          </label>
          <input
            id={campId}
            className={inputClass}
            placeholder="spring-instagram"
            maxLength={40}
            value={campaign}
            onChange={(e) => setCampaign(e.target.value.toLowerCase())}
          />
        </div>
        <button
          type="submit"
          className={buttonClass}
          disabled={create.isPending || !destination.trim()}
        >
          {create.isPending ? "Creating…" : "Create link"}
        </button>
      </div>
      {create.error && <ErrorNote>{friendlyError(create.error)}</ErrorNote>}
    </form>
  );
}

const ICONS: Record<Network, typeof Share2> = {
  whatsapp: MessageCircle,
  facebook: Facebook,
  telegram: Send,
  x: Twitter, // ponytail: lucide has no X logo; swap in a brand SVG if it matters
  instagram: Instagram,
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Share button plus one button per network. `url` is the page being shared;
 * `message` builds the text for a given (UTM-tagged) URL.
 */
function ShareControl(props: { url: string; message: (url: string) => string; label?: string }) {
  const [open, setOpen] = useState(false);
  const tagged = (n: Network | "native") => withUtm(props.url, n);

  const share = async () => {
    setOpen(true);
    if (typeof navigator.share !== "function") return;
    const url = tagged("native");
    try {
      // The message already contains the URL, so it's sent as text only.
      await navigator.share({ text: props.message(url) });
    } catch {
      /* cancelled: the network buttons are still showing */
    }
  };

  const onNetwork = async (n: Network, e: React.MouseEvent<HTMLAnchorElement>) => {
    const url = tagged(n);
    const target = networkShare(n, props.message(url), url);
    if (!target.copy) return; // plain link, let the browser open it
    // Copy before opening: the clipboard only works while this tab has focus.
    e.preventDefault();
    const copied = await copyText(target.copy);
    toast(copied ? target.toast : "Couldn't copy automatically. Copy the text above first.");
    window.open(target.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void share()}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        {props.label ?? "Share"}
      </button>
      {open &&
        NETWORKS.map((n) => {
          const Icon = ICONS[n];
          const url = tagged(n);
          return (
            <a
              key={n}
              href={networkShare(n, props.message(url), url).href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${NETWORK_LABEL[n]}`}
              title={`Share on ${NETWORK_LABEL[n]}`}
              onClick={(e) => void onNetwork(n, e)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-joat-cream transition-colors hover:border-joat-gold hover:text-joat-gold"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </a>
          );
        })}
    </div>
  );
}

function CodeCard(props: {
  programId: string;
  code: string;
  siteUrl: string;
  discountPercent: number | null;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-3 rounded-[12px] border border-joat-gold bg-joat-black p-5">
      <p className="text-sm font-medium text-joat-cream">Your ambassador code</p>
      <p className="font-mono text-3xl font-bold tracking-widest text-joat-gold">{props.code}</p>
      <p className="text-sm text-muted-foreground">
        People who type the website address themselves can enter this code on the website or in the
        shop cart, so the sale is still credited to you.
        {props.discountPercent != null &&
          ` At checkout it also gives them ${props.discountPercent}% off (once per customer).`}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-live="polite"
          onClick={async () => {
            const ok = await copyText(props.code);
            setCopied(ok);
            if (ok) setTimeout(() => setCopied(false), 2000);
          }}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] bg-joat-gold px-4 py-2 text-sm font-medium text-joat-black transition-colors hover:bg-joat-gold-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-joat-gold"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <ShareControl
        url={props.siteUrl}
        label="Share code"
        message={() => codeMessage(props.programId, props.code)}
      />
    </div>
  );
}
