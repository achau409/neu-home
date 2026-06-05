import supabase from "@/utils/supabase/client";

export async function isBlockedSubmission(
  ip: string,
  email: string
): Promise<boolean> {
  if (!ip || !email) return false;
  if (email.toLowerCase().endsWith("@neu.com")) return false;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("form_submissions_log")
    .select("id")
    .eq("ip_address", ip)
    .gte("submitted_at", since)
    .limit(1);

  return Array.isArray(data) && data.length > 0;
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
