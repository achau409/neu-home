import supabase from "@/utils/supabase/client";

export async function isBlockedSubmission(
  ip: string,
  email: string
): Promise<boolean> {
  if (!ip || !email) return false;
  if (email.toLowerCase().endsWith("@neu.com")) return false;

  const { data } = await supabase
    .from("form_submissions_log")
    .select("id")
    .eq("ip_address", ip)
    .eq("email", email.toLowerCase())
    .maybeSingle();

  return !!data;
}

export async function logSubmission(
  ip: string,
  email: string,
  servicePage: string
): Promise<void> {
  if (!ip || !email) return;

  await supabase.from("form_submissions_log").insert({
    ip_address: ip,
    email: email.toLowerCase(),
    service_page: servicePage,
  });
}
