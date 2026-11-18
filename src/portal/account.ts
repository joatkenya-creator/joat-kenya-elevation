import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Every read here goes through Row Level Security: the browser only ever
// receives rows the signed-in user is allowed to see. Roles shown in the UI are
// for display; the database is what enforces them.

export type Program = {
  id: string;
  name: string;
  accepting_applications: boolean;
  attribution_window_days: number;
  attribution_model: "first_touch" | "last_touch" | null;
};

export type MembershipStatus = "pending" | "approved" | "rejected" | "suspended" | "withdrawn";
export type StaffRole = "super_admin" | "program_manager" | "finance" | "support";

export type Account = {
  profile: { public_code: string; full_name: string; country: string } | null;
  memberships: { program_id: string; status: MembershipStatus }[];
  staff: { role: StaffRole; program_id: string | null }[];
  /** "aal2" once the user has passed two-factor sign-in this session. */
  aal: string | null;
};

export function usePrograms() {
  return useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_programs")
        .select("id, name, accepting_applications, attribution_window_days, attribution_model")
        .order("id", { ascending: false });
      if (error) throw error;
      return data as Program[];
    },
  });
}

export function useAccount(userId: string | undefined) {
  return useQuery({
    queryKey: ["account", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Account> => {
      const [profile, memberships, staff, aal] = await Promise.all([
        supabase
          .from("affiliate_profiles")
          .select("public_code, full_name, country")
          .eq("id", userId!)
          .maybeSingle(),
        supabase
          .from("affiliate_memberships")
          .select("program_id, status")
          .eq("profile_id", userId!),
        supabase.from("partner_staff").select("role, program_id").eq("user_id", userId!),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);
      const error = profile.error ?? memberships.error ?? staff.error ?? aal.error;
      if (error) throw error;
      return {
        profile: profile.data,
        memberships: (memberships.data ?? []) as Account["memberships"],
        staff: (staff.data ?? []) as Account["staff"],
        aal: aal.data?.currentLevel ?? null,
      };
    },
  });
}

export const ROLE_LABEL: Record<StaffRole, string> = {
  super_admin: "Super administrator",
  program_manager: "Programme manager",
  finance: "Finance",
  support: "Support (read-only)",
};
