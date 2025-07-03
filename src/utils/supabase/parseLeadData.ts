import { LeadFormData } from "@/types/email";

export function parseLeadFormData(rawData: string): LeadFormData {
  const extractValue = (key: string): string => {
    const regex = new RegExp(`${key}:**([^*]+)`);
    const match = rawData.match(regex);
    return match ? match[1].trim() : "";
  };

  return {
    zip: extractValue("ZIP"),
    cityState: extractValue("CITY,STATE"),
    name: extractValue("Name"),
    email: extractValue("Email"),
    phone: extractValue("Phone"),
    showerInterest: extractValue(
      "DescriptionWhy are you interested in a walk-in shower"
    ),
    isHomeowner: extractValue("Are you the homeowner"),
    projectDescription: extractValue("How would your describe your project"),
    isManufacturedHome: extractValue(
      "Is it a mobile, modular or manufactured home"
    ),
    isInsuranceClaim: extractValue(
      "Is this request covered by an insurance or VA claim"
    ),
  };
}
