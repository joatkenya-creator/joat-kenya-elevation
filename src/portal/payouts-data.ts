import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type MyPayout = {
  batch_id: string;
  currency: string;
  amount: string;
  status: "approved" | "paid";
  method: "mpesa" | "bank";
  approved_at: string | null;
  paid_at: string | null;
  paid_reference: string | null;
};

export function useMyPayouts() {
  return useQuery({
    queryKey: ["my-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_payouts");
      if (error) throw error;
      return (data ?? []) as MyPayout[];
    },
  });
}

export type MyPayoutDetails = {
  method: "mpesa" | "bank";
  account_name: string;
  destination: string;
  updated_at: string;
};

export function useMyPayoutDetails() {
  return useQuery({
    queryKey: ["payout-details"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_payout_details");
      if (error) throw error;
      return ((data ?? []) as MyPayoutDetails[])[0] ?? null;
    },
  });
}

/** Own clicks over the last 60 days (enough for 30-day totals and the change). */
export function useMyClicks(userId: string) {
  return useQuery({
    queryKey: ["my-clicks", userId],
    queryFn: async () => {
      const since = new Date(Date.now() - 60 * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("affiliate_clicks")
        .select("at, program_id")
        .eq("profile_id", userId)
        .eq("is_duplicate", false)
        .gte("at", since)
        .limit(10000);
      if (error) throw error;
      return (data ?? []) as { at: string; program_id: string }[];
    },
  });
}
