import supabase from "@/utils/supabase/client";

/** Row shape returned from service zip tables (see ZipSearchForm). */
export type ServiceZipRow = {
  Zip_Code?: string;
  City: string;
  State: string;
  Service: string;
  "Company name": string;
  "Lead Delivery Email": string;
};

const ZIP_SELECT =
  `Zip_Code, City, State, Service, "Company name", "Lead Delivery Email"` as const;

/** Same lookup as ZipSearchForm `validateModalZip` — 5-digit zip + Service_Slug. */
export async function fetchServiceZipRow(
  zipCodesTable: string,
  zip: string,
  serviceSlug: string
): Promise<{ data: ServiceZipRow[] | null; error: Error | null }> {
  if (zip.length !== 5) {
    return { data: null, error: null };
  }
  try {
    const { data, error } = await supabase
      .from(zipCodesTable)
      .select(ZIP_SELECT)
      .eq("Zip_Code", zip)
      .eq("Service_Slug", serviceSlug);

    if (error) {
      return { data: null, error: new Error(error.message || "ZIP lookup failed") };
    }
    return { data: (data ?? []) as ServiceZipRow[], error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e : new Error("Could not check ZIP code. Please try again."),
    };
  }
}
