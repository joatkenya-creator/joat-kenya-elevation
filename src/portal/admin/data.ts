import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MembershipStatus } from "../account";

// Admin reads. Row Level Security trims every result to the programmes the
// signed-in staff member may see, so these queries never filter by role.
// ponytail: loads all rows in scope; add paging once a programme has thousands.

export type MemberRow = {
  profile_id: string;
  program_id: string;
  status: MembershipStatus;
  status_changed_at: string;
  created_at: string;
  commission_rate: string;
  affiliate_profiles: {
    full_name: string;
    country: string;
    social_links: string[];
    public_code: string;
  } | null;
};

export type ApplicationRow = {
  id: string;
  user_id: string;
  programs: string[];
  website: string | null;
  audience: string | null;
  experience: string | null;
  marketing_interests: string | null;
  created_at: string;
};

export type AuditRow = {
  id: number;
  at: string;
  actor_id: string | null;
  action: string;
  program_id: string | null;
  subject_id: string | null;
  details: { reason?: string | null; from?: string };
};

export function useMembers() {
  return useQuery({
    queryKey: ["admin", "members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_memberships")
        .select(
          "profile_id, program_id, status, status_changed_at, created_at, commission_rate, affiliate_profiles(full_name, country, social_links, public_code)",
        )
        .order("status_changed_at", { ascending: false });
      if (error) throw error;
      return data as unknown as MemberRow[];
    },
  });
}

export function useApplications() {
  return useQuery({
    queryKey: ["admin", "applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_applications")
        .select(
          "id, user_id, programs, website, audience, experience, marketing_interests, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ApplicationRow[];
    },
  });
}

export function useActivity() {
  return useQuery({
    queryKey: ["admin", "activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_audit_log")
        .select("id, at, actor_id, action, program_id, subject_id, details")
        .order("at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AuditRow[];
    },
  });
}

/** Approve, reject, suspend or reinstate. The database enforces who and which. */
export function useReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (v: {
      profileId: string;
      programId: string;
      status: "approved" | "rejected" | "suspended";
      reason?: string;
    }) => {
      const { error } = await supabase.rpc("review_partner_membership", {
        p_profile_id: v.profileId,
        p_program_id: v.programId,
        p_status: v.status,
        p_reason: v.reason ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });
}

/** Moves an ambassador between the 8% starting rate and the 10% growth rate. */
export function useSetRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (v: {
      profileId: string;
      programId: string;
      rate: number;
      reason: string;
    }) => {
      const { error } = await supabase.rpc("set_commission_rate", {
        p_profile: v.profileId,
        p_program: v.programId,
        p_rate: v.rate,
        p_reason: v.reason,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });
}

export type AdminLink = {
  id: string;
  code: string;
  profile_id: string;
  program_id: string;
  destination_path: string;
  campaign: string | null;
  status: "active" | "disabled";
};

export function useAllLinks() {
  return useQuery({
    queryKey: ["admin", "links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("id, code, profile_id, program_id, destination_path, campaign, status")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdminLink[];
    },
  });
}

export function useSetLinkStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (v: { linkId: string; status: "active" | "disabled"; reason?: string }) => {
      const { error } = await supabase.rpc("set_partner_link_status", {
        p_link_id: v.linkId,
        p_status: v.status,
        p_reason: v.reason ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });
}

export type FraudSignal = {
  profile_id: string;
  program_id: string;
  clicks: number;
  unique_visitors: number;
  top_visitor_clicks: number;
  duplicate_clicks: number;
  sales: number;
  self_referrals: number;
};

/** Last 30 days per ambassador and programme; aggregate counts only. */
export function useFraudSignals() {
  return useQuery({
    queryKey: ["admin", "signals"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("partner_fraud_signals");
      if (error) throw error;
      return (data ?? []) as FraudSignal[];
    },
  });
}

/** Plain-language warnings for review. Thresholds are deliberately simple. */
export function fraudFlags(s: FraudSignal | undefined): string[] {
  if (!s) return [];
  const flags: string[] = [];
  const unique = s.clicks - s.duplicate_clicks;
  if (s.self_referrals > 0) flags.push("Possible own purchase");
  if (s.clicks >= 20 && s.top_visitor_clicks / s.clicks > 0.5)
    flags.push("Most clicks from one visitor");
  if (s.clicks >= 20 && s.duplicate_clicks / s.clicks > 0.5) flags.push("Many repeat clicks");
  if (unique >= 10 && s.sales / unique > 0.5) flags.push("Unusually high sales rate");
  return flags;
}

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );

/** Only render links that are plain web addresses. */
export const isWebLink = (url: string) => /^https?:\/\//i.test(url);
