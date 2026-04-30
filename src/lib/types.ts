export type WizardOption = {
  id: string;
  label: string;
  sub?: string;
  icon: string;
};

export type WizardData = {
  floor: string | null;
  room: string | null;
  size: string | null;
  timing: string | null;
  zip: string;
  name: string;
  phone: string;
};

export type StepConfig = {
  key: keyof Pick<WizardData, "floor" | "room" | "size" | "timing">;
  q: string;
  opts: WizardOption[];
};

export type Testimonial = {
  name: string;
  location: string;
  text: string;
};

export type FAQItem = {
  q: string;
  a: string;
};
