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
  site_url: string | null;
  shop_url: string | null;
  ambassador_discount_percent: number | null;
};

export type MembershipStatus = "pending" | "approved" | "rejected" | "suspended" | "withdrawn";
export type StaffRole = "super_admin" | "program_manager" | "finance" | "support";

export type Account = {
  profile: { public_code: string; full_name: string; country: string } | null;
  memberships: {
    program_id: string;
    status: MembershipStatus;
    commission_rate: string;
    /** This programme's referral code (one per membership). */
    ref_code: string;
  }[];
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
        .select(
          "id, name, accepting_applications, attribution_window_days, attribution_model, site_url, shop_url, ambassador_discount_percent",
        )
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
          .select("program_id, status, commission_rate, ref_code")
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
  program_manager: "Program manager",
  finance: "Finance",
  support: "Support (read-only)",
};

/** Display only; the review functions re-check this in the database. */
export function canReview(staff: Account["staff"], programId: string) {
  return staff.some(
    (s) => s.role === "super_admin" || (s.role === "program_manager" && s.program_id === programId),
  );
}

/** Super admin, or a programme manager of this programme. */
export const canManage = canReview;

/** Confirms JOAT payments: finance or super admin. */
export const isFinance = (staff: Account["staff"]) =>
  staff.some((s) => s.role === "super_admin" || s.role === "finance");

/** Any staff role that can see this programme's records. */
export const canSee = (staff: Account["staff"], programId: string) =>
  staff.some((s) => s.program_id === null || s.program_id === programId);

export const isSuperAdmin = (staff: Account["staff"]) =>
  staff.some((s) => s.role === "super_admin");

/** Memberships in these states block a new application to the same programme. */
export const ACTIVE_STATUSES: MembershipStatus[] = ["pending", "approved", "suspended"];

// The database functions raise short codes; this turns them into sentences.
const ERRORS: Record<string, string> = {
  programme_closed: "That program isn't accepting applications right now.",
  already_applied: "You've already applied to, or are a member of, that program.",
  no_programme: "Choose at least one program.",
  invalid_link: "Each link must be a full web address starting with https://",
  invalid_name: "Enter your full name.",
  invalid_country: "Enter your country of residence.",
  too_many_links: "You've reached the limit of 10 profile links, or 50 referral links per program.",
  text_too_long: "One of the answers is too long. Please shorten it.",
  terms_not_accepted: "Please accept the program terms, privacy notice and disclosure rules.",
  too_many_applications: "You've applied several times today. Please try again tomorrow.",
  not_signed_in: "Your session has ended. Please sign in again.",
  not_authorised: "You don't have permission to do that.",
  cannot_review_self: "You can't review your own membership. Ask another staff member.",
  invalid_transition:
    "That change isn't allowed from the membership's current status. Refresh and try again.",
  reason_required: "Add a reason. It's kept in the activity log, not shown to the ambassador.",
  not_approved: "You can create links once your membership is approved.",
  invalid_destination:
    "Links can only point to amaresbigplanet.com or the Amare shop (joatkenya.com for JOAT Global).",
  invalid_campaign: "Campaign labels use lowercase letters, numbers and dashes (up to 40).",
  link_exists: "You already have a link for that page and campaign.",
  link_not_found: "That link no longer exists. Refresh and try again.",
  lead_not_referred: "That inquiry didn't come through an ambassador link.",
  engagement_exists: "There's already an engagement for that inquiry.",
  engagement_not_found: "That engagement no longer exists. Refresh and try again.",
  currency_mismatch: "All invoices on one engagement must use the same currency.",
  invoice_exists: "That invoice number is already used.",
  invoice_not_found: "That invoice no longer exists. Refresh and try again.",
  future_date: "The payment date can't be in the future.",
  overpayment: "That would take payments above the invoice amount.",
  invalid_rate: "The rate can only be 8% or 10%.",
  nothing_to_pay:
    "There's nothing to pay in that currency yet: commissions are still on hold, or ambassadors haven't added payout details.",
  cannot_approve_own_payout: "You're paid in this batch, so another finance user must approve it.",
  cannot_approve_own_batch: "Another finance user must approve a batch you created.",
  reference_required: "Enter the M-Pesa or bank transfer reference.",
  duplicate_payment: "That payment reference has already been entered.",
  payment_not_found: "That payment no longer exists. Refresh and try again.",
  cannot_confirm_own_entry:
    "Someone other than the person who recorded this payment must confirm it.",
  nothing_to_withdraw: "There's nothing to leave: this membership is no longer active.",
  membership_not_found: "That membership no longer exists. Refresh and try again.",
  invalid_percent:
    "Enter a discount between 0 and 100 percent, or leave it empty to turn discounts off.",
  no_shop: "Only programs with a shop can have ambassador discount codes.",
  shopify_not_configured:
    "The Shopify admin token isn't set up yet. See docs/partners/shopify-discounts.md.",
};

export function friendlyError(error: { message?: string } | null | undefined) {
  const key = Object.keys(ERRORS).find((k) => error?.message?.includes(k));
  return key ? ERRORS[key] : "Something went wrong. Please try again.";
}
