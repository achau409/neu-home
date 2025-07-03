// types/email.ts
export interface LeadFormData {
  zip: string;
  cityState: string;
  name: string;
  email: string;
  phone: string;
  showerInterest: string;
  isHomeowner: string;
  projectDescription: string;
  isManufacturedHome: string;
  isInsuranceClaim: string;
}

export interface EmailConfig {
  from: {
    name: string;
    email: string;
  };
  to: string[];
  subject: string;
}
