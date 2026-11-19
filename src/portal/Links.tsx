import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { friendlyError, type Program } from "./account";
import { ErrorNote, Loading, buttonClass, inputClass } from "./ui";

// An ambassador's referral links for one approved programme, with click
// counts. Counts are the ambassador's own rows (RLS), duplicates excluded.

type LinkRow = {
  id: string;
  code: string;
  program_id: string;
  destination_path: string;
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
        .select("id, code, program_id, destination_path, campaign, status")
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

function referralUrl(siteUrl: string, publicCode: string, link?: LinkRow) {
  const url = new URL(link ? link.destination_path : "/", siteUrl);
  url.searchParams.set("ref", publicCode);
  if (link) url.searchParams.set("ln", link.code);
  return url.toString();
}

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
    <section className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">Your {program.name} links</h3>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "click" : "clicks"} in the last {DAYS} days
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Always say you're a JOAT Global ambassador and may earn a commission, right next to the
        link. A visit is credited to you for {program.attribution_window_days} days; if the visitor
        later clicks another ambassador's link, the newer link gets the credit.
      </p>

      <ul className="divide-y divide-border rounded-md border border-border">
        <LinkItem
          label="Home page"
          url={referralUrl(program.site_url, props.publicCode)}
          clicks={clickCount(null)}
        />
        {mine.map((l) => (
          <LinkItem
            key={l.id}
            label={`${l.destination_path}${l.campaign ? ` · ${l.campaign}` : ""}`}
            url={referralUrl(program.site_url!, props.publicCode, l)}
            clicks={clickCount(l.id)}
            disabled={l.status === "disabled"}
          />
        ))}
      </ul>

      <NewLink programId={program.id} siteUrl={program.site_url} userId={props.userId} />
    </section>
  );
}

function LinkItem(props: { label: string; url: string; clicks: number; disabled?: boolean }) {
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
        <p className="text-sm font-medium">
          {props.label}
          {props.disabled && (
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-900">
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
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
            aria-live="polite"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        )}
      </div>
    </li>
  );
}

function NewLink(props: { programId: string; siteUrl: string; userId: string }) {
  const queryClient = useQueryClient();
  const [destination, setDestination] = useState("");
  const [campaign, setCampaign] = useState("");
  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("create_partner_link", {
        p_program_id: props.programId,
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
  const destId = `dest-${props.programId}`;
  const campId = `camp-${props.programId}`;

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
            Page on {new URL(props.siteUrl).host}
          </label>
          <input
            id={destId}
            className={inputClass}
            placeholder={`${props.siteUrl}/…`}
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
