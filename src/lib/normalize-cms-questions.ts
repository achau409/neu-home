/** Shape used by Payload / Services API → in-page wizard (radio grid). */
export type WizardCmsRadioQuestion = {
  name: string;
  title: string;
  options: string[];
  validation?: unknown;
  warningMessage?: {
    condition?: string | string[];
    message: string;
    buttons?: boolean;
  };
};

function coerceOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      out.push(item);
      continue;
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      if (typeof o.label === "string") out.push(o.label);
      else if (typeof o.value === "string") out.push(o.value);
      else if (typeof o.title === "string") out.push(o.title);
    }
  }
  return out.filter(Boolean);
}

/** One CMS row → normalized radio question or null if unusable. */
export function normalizeCmsQuestion(raw: unknown): WizardCmsRadioQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const type = String(o.type ?? "").toLowerCase();
  if (type && type !== "radio") return null;

  const name = String(o.name ?? o.fieldName ?? "").trim();
  const title = String(o.title ?? o.label ?? o.question ?? name).trim();
  const options = coerceOptions(o.options);
  if (!name || !title || options.length === 0) return null;

  const wm = o.warningMessage;
  let warningMessage: WizardCmsRadioQuestion["warningMessage"];
  if (wm && typeof wm === "object") {
    const w = wm as Record<string, unknown>;
    warningMessage = {
      message: typeof w.message === "string" ? w.message : "",
      buttons: Boolean(w.buttons),
      condition:
        typeof w.condition === "string"
          ? w.condition
          : Array.isArray(w.condition)
            ? w.condition.filter((x): x is string => typeof x === "string")
            : undefined,
    };
    if (!warningMessage.message) warningMessage = undefined;
  }

  return {
    name,
    title,
    options,
    validation: o.validation,
    warningMessage,
  };
}

export function prioritizeOpeningWizard(
  steps: WizardCmsRadioQuestion[],
  openingWizard?: string
): WizardCmsRadioQuestion[] {
  if (!openingWizard) return steps;
  const starter = steps.find((q) => q.name === openingWizard);
  if (!starter) return steps;
  return [starter, ...steps.filter((q) => q.name !== openingWizard)];
}

/** Same demo as CMS JSON — used when `/test` has no Payload service doc. */
export const DEMO_RADIO_QUESTIONS: WizardCmsRadioQuestion[] = [
  {
    name: "FlooringMaterials",
    title: "What kind of materials are you interested in?",
    options: ["Vinyl", "Carpet", "Hardwood", "Laminate", "Tile"],
    validation: { type: "required", message: "You must select at least one option" },
  },
  {
    name: "HomeOwner",
    title: "Are you the homeowner or authorized to make property changes?",
    options: ["Yes", "No"],
    validation: { type: "required", message: "You must select an option" },
    warningMessage: {
      buttons: true,
      message:
        "Our installers require the homeowner or someone authorized to make property changes be present during the estimate. Would you like to continue?",
      condition: "No",
    },
  },
  {
    name: "whatToDo",
    title: "What do you need help with?",
    options: ["Replace Flooring", "Repair Flooring"],
    validation: { type: "required", message: "You must select an option" },
    warningMessage: {
      buttons: true,
      message:
        "Unfortunately, our installers only offer flooring replacement at this time. Would you like to continue?",
      condition: "Repair Flooring",
    },
  },
];

/** Parses Payload `questions` into ordered radio-only wizard steps (empty array if none). */
export function normalizeWizardRadioQuestionsFromCms(
  raw: unknown,
  openingWizard?: string
): WizardCmsRadioQuestion[] {
  const list = Array.isArray(raw) ? raw : [];
  const normalized = list
    .map(normalizeCmsQuestion)
    .filter((q): q is WizardCmsRadioQuestion => q != null);

  return prioritizeOpeningWizard(normalized, openingWizard);
}
