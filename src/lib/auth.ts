import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { deliverCourseRegistrationViaWeb3Forms } from "@/lib/web3forms";

export type Tier = "builder" | "shipper" | "pro";
export type RegistrantType = "student" | "parent";
export type PaymentPreference = "full" | "installments" | "parent_pays";

export type CourseStudent = {
  id: string;
  full_name: string;
  phone: string;
  registrant_type: RegistrantType;
  college: string | null;
  tier: Tier;
  payment_preference: PaymentPreference;
  how_heard: string | null;
  created_at: string;
};

export type PendingRegistration = {
  full_name: string;
  phone: string;
  registrant_type: RegistrantType;
  college: string;
  tier: Tier;
  payment_preference: PaymentPreference;
  how_heard: string;
};

// Whether Supabase returns a session immediately from signUp() depends on
// the project's "confirm email" setting (a dashboard toggle, not something
// a migration controls). If no session comes back, the profile can't be
// inserted yet (RLS requires auth.uid()), so we stash the form fields here
// and finish the insert once the student actually has a session — either
// right after signUp (if confirmation is off) or after they log in post
// confirmation (if it's on and this is the same browser).
const PENDING_KEY = "joat_course_pending_registration";

export function savePendingRegistration(data: PendingRegistration) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(data));
}

export function readPendingRegistration(): PendingRegistration | null {
  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingRegistration;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  localStorage.removeItem(PENDING_KEY);
}

/** Tracks the current Supabase Auth session, live. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}

export async function signUpStudent(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInStudent(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutStudent() {
  return supabase.auth.signOut();
}

export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/courses/login`,
  });
}

export async function insertCourseStudentRow(
  userId: string,
  email: string,
  data: PendingRegistration,
) {
  const result = await supabase.from("course_students").insert({
    id: userId,
    full_name: data.full_name.trim(),
    phone: data.phone.trim(),
    registrant_type: data.registrant_type,
    college: data.college.trim() || null,
    tier: data.tier,
    payment_preference: data.payment_preference,
    how_heard: data.how_heard.trim() || null,
  });

  if (!result.error) {
    // Routes the lead to the team's inbox — best-effort, never blocks the
    // student since the row above is already saved.
    const registeredAt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Nairobi",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
    void deliverCourseRegistrationViaWeb3Forms({
      fullName: data.full_name.trim(),
      email,
      phone: data.phone.trim(),
      registrantType: data.registrant_type,
      college: data.college.trim() || null,
      tier: data.tier,
      paymentPreference: data.payment_preference,
      howHeard: data.how_heard.trim() || null,
      registeredAt: `${registeredAt} (EAT)`,
    });
  }

  return result;
}

export async function fetchCourseStudentRow(userId: string) {
  return supabase.from("course_students").select("*").eq("id", userId).maybeSingle<CourseStudent>();
}
