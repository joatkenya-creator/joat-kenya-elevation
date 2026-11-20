import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ConversionRow = {
  program_id: string;
  profile_id: string;
  kind: "shop_order" | "engagement";
  reference: string;
  occurred_at: string | null;
  currency: string | null;
  revenue: string;
  refunded: string;
  status: "verified" | "awaiting_payment" | "disputed" | "reversed";
  commission: string;
  hold_until: string | null;
};

/** The view itself limits rows to the signed-in ambassador (or staff scope). */
export function useConversions(key: string) {
  return useQuery({
    queryKey: ["conversions", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_conversions")
        .select(
          "program_id, profile_id, kind, reference, occurred_at, currency, revenue, refunded, status, commission, hold_until",
        )
        .order("occurred_at", { ascending: false, nullsFirst: true });
      if (error) throw error;
      return data as ConversionRow[];
    },
  });
}
