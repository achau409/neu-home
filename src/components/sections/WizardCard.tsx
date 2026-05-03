"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import posthog from "posthog-js";
import supabase from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { WizardData } from "@/lib/types";
import type { ServiceData } from "@/types/service";
import {
  DEMO_RADIO_QUESTIONS,
  normalizeWizardRadioQuestionsFromCms,
  type WizardCmsRadioQuestion,
} from "@/lib/normalize-cms-questions";
import {
  fetchServiceZipRow,
  type ServiceZipRow,
} from "@/lib/validate-service-zip";
import { getMaterialOptionIconSrc } from "@/lib/material-option-icons";
import ThankYouModal from "@/components/SubmitForm/ThankYouModal";
import { cn } from "@/lib/utils";

interface WizardCardProps {
  /** From `getServicesBySlug`. Omit on local `/test` to use demo questions only. */
  serviceData?: ServiceData | null;
  service?: string;
  initialUserCity?: string;
  initialUserState?: string;
}

/**
 * Tailwind mapping of wizard + form styles from `src/app/test/test.css`
 * (.card, .display, .btn*, .input, .pill*, .wiz-*).
 */
const wizTw = {
  card: "rounded-2xl border border-[var(--line-soft)] bg-white [box-shadow:var(--shadow-sm)]",
  display:
    "[font-family:var(--font-display),var(--font-inter),sans-serif] font-bold tracking-[-0.025em] leading-[1.05]",

  pill: "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.02em]",
  pillCream: "bg-[var(--cream-warm)] text-[var(--navy)]",
  pillGreen: "bg-[var(--green-soft)] text-[var(--green)]",

  wizProgress: "flex gap-1",
  wizStep: "h-1 flex-1 rounded-full bg-[var(--line)] transition-colors duration-300",
  wizStepActive: "bg-[var(--navy)]",

  wizOption:
    "flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-[var(--line)] bg-white px-3.5 py-3.5 text-left font-inherit text-sm text-[var(--ink)] transition-all duration-100 active:scale-[0.98] hover:border-[var(--navy)]",
  wizOptionSelected: "border-[var(--navy)] bg-[var(--cream-warm)]",

  wizOptionIcon: "grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-lg font-bold text-[var(--navy)]",
  wizOptionIconIdle: "bg-[var(--cream-warm)]",
  wizOptionIconSelected: "bg-[var(--yellow)]",

  input:
    "w-full rounded-xl border-2 border-[var(--line)] bg-white px-4 py-4 font-inherit text-base text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-100 focus:border-[var(--navy)] focus:shadow-[0_0_0_4px_rgba(14,42,74,0.12)]",

  btn: "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-none px-[22px] py-[14px] font-inherit text-[15px] font-bold no-underline transition-[transform,box-shadow,background] duration-100",
  btnYellow:
    "bg-[var(--yellow)] text-[var(--navy)] shadow-[0_4px_0_var(--yellow-deep)] active:translate-y-0.5 active:shadow-[0_2px_0_var(--yellow-deep)]",
  btnGhost:
    "border-[1.5px] border-solid border-[var(--navy)] bg-transparent text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white",
  btnLg: "rounded-[14px] px-[26px] py-[18px] text-base",
  btnBlock: "w-full",
} as const;

const initial: WizardData = {
  floor: null,
  room: null,
  size: null,
  timing: null,
  zip: "",
  name: "",
  phone: "",
  email: "",
};

/** Same validation as SubmitForm `phoneNumber` step. */
const PHONE_REGEX =
  /^(\+1\s?)?(\(\d{3}\)\s?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/;

/** Same rules as SubmitForm composite step (`fullName` + `Email` fields). */
const FULL_NAME_REGEX = /^[a-zA-Z.]+ [a-zA-Z.]+.*$/;
const wizardEmailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format");

function getFullNameValidationMessage(fullName: string): string | null {
  const t = fullName.trim();
  if (!t) return "Full name is required";
  if (!FULL_NAME_REGEX.test(t)) return "Please enter your first and last name";
  return null;
}

function getEmailValidationMessage(email: string): string | null {
  const r = wizardEmailSchema.safeParse(email.trim());
  if (!r.success) return r.error.issues[0]?.message ?? "Invalid email format";
  return null;
}

function identityStepValid(name: string, email: string): boolean {
  return !getFullNameValidationMessage(name) && !getEmailValidationMessage(email);
}

function warningMatches(condition: WizardCmsRadioQuestion["warningMessage"], selection: string) {
  if (!condition?.condition) return false;
  const c = condition.condition;
  return Array.isArray(c) ? c.includes(selection) : selection === c;
}

export default function WizardCard({
  serviceData,
  service: serviceProp,
  initialUserCity,
  initialUserState,
}: WizardCardProps) {
  const { toast } = useToast();

  const service = serviceProp ?? serviceData?.slug ?? "demo";
  const fromCms = useMemo(
    () => normalizeWizardRadioQuestionsFromCms(serviceData?.questions),
    [serviceData?.questions]
  );
  /** Demo steps when no Payload doc (`/test`); CMS payload drives production. */
  const cmsQuestions = useMemo(
    () => (serviceData ? fromCms : fromCms.length > 0 ? fromCms : DEMO_RADIO_QUESTIONS),
    [serviceData, fromCms]
  );

  /** After CMS radios: name/email → ZIP + phone + submit together (last). */
  const identityStepIndex = cmsQuestions.length;
  const contactStepIndex = cmsQuestions.length + 1;
  const total = cmsQuestions.length + 2;

  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(initial);
  const [submitted, setSubmitted] = useState<WizardData | null>(null);
  const [thankYouPartnerDisplay, setThankYouPartnerDisplay] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingWarning, setPendingWarning] = useState<{
    questionName: string;
    message: string;
  } | null>(null);

  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");
  const [zipMatched, setZipMatched] = useState(false);
  const [validatedZipRow, setValidatedZipRow] = useState<ServiceZipRow | null>(null);
  const [validatedZipKey, setValidatedZipKey] = useState("");

  /** Same `/api/validate-phone` usage as SubmitForm (`validatePhoneInline`). */
  const [phoneValidation, setPhoneValidation] = useState<{
    status: "idle" | "verifying" | "pass" | "fail";
    score?: number;
    lineType?: string;
  }>({ status: "idle" });

  /** Show name/email validation under fields after blur, typing, or failed Continue. */
  const [nameBlurred, setNameBlurred] = useState(false);
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [identityShowErrors, setIdentityShowErrors] = useState(false);

  useEffect(() => {
    if (step === identityStepIndex) return;
    setNameBlurred(false);
    setEmailBlurred(false);
    setIdentityShowErrors(false);
  }, [step, identityStepIndex]);

  const set = <K extends keyof WizardData>(k: K, v: WizardData[K]) =>
    setData((d) => ({ ...d, [k]: v }));
  const next = () => setStep((s) => Math.min(total - 1, s + 1));
  const back = () => {
    setPendingWarning(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const hasZipTable =
    !!serviceData?.zipCodes && typeof serviceData.zipCodes === "string";

  /* ZIP lookup — mirrors ZipSearchForm `validateModalZip` (+ hero clear when short). */
  useEffect(() => {
    const z = data.zip;

    if (z.length !== 5) {
      setZipLoading(false);
      setZipMatched(false);
      setZipError("");
      setValidatedZipRow(null);
      setValidatedZipKey("");
      return;
    }

    if (!hasZipTable) {
      setZipLoading(false);
      setZipMatched(true);
      setZipError("");
      setValidatedZipRow(null);
      setValidatedZipKey(z);
      return;
    }

    let cancelled = false;
    setZipLoading(true);
    setZipError("");

    void (async () => {
      const { data: rows, error } = await fetchServiceZipRow(
        serviceData!.zipCodes,
        z,
        service
      );
      if (cancelled) return;
      setZipLoading(false);

      if (error) {
        setZipMatched(false);
        setValidatedZipRow(null);
        setValidatedZipKey("");
        setZipError("Could not check ZIP code. Please try again.");
        return;
      }

      if (rows?.length) {
        setZipMatched(true);
        setValidatedZipRow(rows[0]);
        setValidatedZipKey(z);
      } else {
        setZipMatched(false);
        setValidatedZipRow(null);
        setValidatedZipKey("");
        setZipError("ZIP code is currently not serviced by our contractor.");
        try {
          posthog.capture("zip_not_serviced", {
            zip_code: z,
            service,
            location: "wizard",
          });
        } catch {
          // non-critical
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data.zip, service, hasZipTable, serviceData?.zipCodes]);

  if (submitted) {
    const heroUrl = typeof serviceData?.heroImage?.url === "string" ? serviceData.heroImage.url : "";
    const custLogoUrl =
      typeof serviceData?.customerLogo?.url === "string" ? serviceData.customerLogo.url : "";

    return (
      <ThankYouModal
        isOpen
        setIsOpen={(open) => {
          if (!open) setSubmitted(null);
        }}
        companyName={thankYouPartnerDisplay}
        heroImage={heroUrl}
        contactPhone={typeof serviceData?.contactPhone === "string" ? serviceData.contactPhone : ""}
        service={service}
        customerLogo={custLogoUrl}
      />
    );
  }

  /** CMS published service but editor left questions empty — avoid broken UX. */
  if (cmsQuestions.length === 0 && serviceData) {
    return (
      <section className="mx-auto max-w-[1180px] px-4 -mt-20">
        <div className={cn(wizTw.card, "relative z-[99] flex flex-col gap-[14px] p-[18px]")}>
          <h3 className={cn(wizTw.display, "m-0 text-[22px] text-[var(--navy)]")}>
            Estimate form unavailable
          </h3>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            This service doesn&apos;t have form questions configured in the CMS yet. Please check
            back soon or contact us directly.
          </p>
        </div>
      </section>
    );
  }

  const sendEmails = async (recipientEmails: string, subject: string, message: string) => {
    const emailList = recipientEmails.split(",").map((e) => e.trim()).filter(Boolean);
    await Promise.all(
      emailList.map((email) =>
        fetch("/api/sendEmails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderEmail: "leads@neuhomeservices.com",
            senderName: "Neumediagroup",
            subject,
            message,
            recipientEmail: email,
          }),
        })
      )
    );
  };

  const detectClientInfo = () => {
    const userAgent = navigator.userAgent;
    let os = "Unknown OS";
    if (/windows/i.test(userAgent)) os = "Windows";
    else if (/mac/i.test(userAgent)) os = "MacOS";
    else if (/linux/i.test(userAgent)) os = "Linux";
    else if (/android/i.test(userAgent)) os = "Android";
    else if (/iphone|ipad/i.test(userAgent)) os = "iOS";

    let browser = "Unknown Browser";
    if (/edg/i.test(userAgent)) browser = "Edge";
    else if (/chrome/i.test(userAgent)) browser = "Chrome";
    else if (/safari/i.test(userAgent)) browser = "Safari";
    else if (/firefox/i.test(userAgent)) browser = "Firefox";

    return { os, browser };
  };

  const syncHiddenFields = (formValues: Record<string, unknown>) => {
    const tfInput = document.getElementById("xxTrustedFormCertUrl") as HTMLInputElement | null;
    const tfValue = tfInput?.value;
    if (tfValue) formValues.xxTrustedFormCertUrl = tfValue;
    const hpInput = document.getElementById("hp_website") as HTMLInputElement | null;
    formValues.honeypot = hpInput?.value || "";
    formValues.honeypot_field_name = "website";
    return formValues;
  };

  const validatePhoneInline = async (inputValue: string) => {
    const digitsOnly = (inputValue || "").replace(/\D/g, "");
    if (!digitsOnly || digitsOnly.length < 10) {
      setPhoneValidation({ status: "idle" });
      return;
    }

    try {
      setPhoneValidation({ status: "verifying" });
      const res = await fetch("/api/validate-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digitsOnly }),
      });

      if (!res.ok) {
        setPhoneValidation({ status: "fail" });
        return;
      }

      const j = await res.json();
      const validationStatus = j?.is_valid ? "pass" : "fail";

      setPhoneValidation({
        status: validationStatus,
        score: typeof j?.activity_score === "number" ? j.activity_score : undefined,
        lineType: typeof j?.line_type === "string" ? j.line_type : undefined,
      });
    } catch {
      setPhoneValidation({ status: "fail" });
    }
  };

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    let display = digits;
    if (digits.length > 6) {
      display = `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      display = `(${digits.slice(0, 3)})${digits.slice(3)}`;
    }
    set("phone", display);
    void validatePhoneInline(display);
  };

  const applyZipRowToLead = (
    row: ServiceZipRow | null
  ): {
    city?: string;
    state?: string;
    companyName: string;
    leadEmail: string;
    product: string;
  } => {
    let city = initialUserCity;
    let state = initialUserState;
    let companyName = "";
    let leadEmail = "";
    let product = "";
    if (row) {
      city = row.City || city;
      state = row.State || state;
      companyName = row["Company name"] || "";
      leadEmail = row["Lead Delivery Email"] || "";
      product = typeof row.Service === "string" ? row.Service : "";
    }
    return { city, state, companyName, leadEmail, product };
  };

  const submitLead = async () => {
    if (
      getFullNameValidationMessage(data.name) ||
      getEmailValidationMessage(data.email || "") ||
      !data.phone.trim() ||
      !PHONE_REGEX.test(data.phone.trim()) ||
      data.zip.length !== 5 ||
      isSubmitting ||
      phoneValidation.status === "verifying"
    ) {
      return;
    }

    if (hasZipTable && (!zipMatched || validatedZipKey !== data.zip)) {
      toast({
        title: "ZIP code",
        description: "Enter a serviced 5-digit ZIP code to continue.",
      });
      return;
    }

    const table =
      typeof serviceData?.serviceRequest === "string" ? serviceData.serviceRequest.trim() : "";
    if (!table) {
      toast({
        title: "Demo mode",
        description: "No serviceRequest table configured — nothing was saved.",
      });
      const { companyName: zipCompany } = applyZipRowToLead(validatedZipRow);
      setThankYouPartnerDisplay(
        zipCompany.trim() || serviceData?.title?.trim() || "your local estimator",
      );
      setSubmitted({ ...data, email: data.email });
      return;
    }

    setIsSubmitting(true);
    try {
      const { os, browser } = detectClientInfo();
      let serverIp = "";
      try {
        const res = await fetch("/api/getIP", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          serverIp = json?.ip ?? "";
        }
      } catch {
        // non-critical
      }

      let { city, state, companyName, leadEmail, product } = applyZipRowToLead(validatedZipRow);

      const rowMatches = hasZipTable && validatedZipRow && validatedZipKey === data.zip;
      if (hasZipTable && !rowMatches) {
        const { data: zipRows } = await supabase
          .from(serviceData!.zipCodes)
          .select(`City, State, Service, "Company name", "Lead Delivery Email"`)
          .eq("Zip_Code", data.zip)
          .eq("Service_Slug", service);
        const row = zipRows?.[0];
        const applied = applyZipRowToLead(row ?? null);
        city = applied.city;
        state = applied.state;
        companyName = applied.companyName;
        leadEmail = applied.leadEmail;
        product = applied.product;
      }

      const [firstName, ...rest] = data.name.trim().split(/\s+/);
      const lastName = rest.join(" ");

      const basePayload: Record<string, unknown> = {
        ...answers,
        fullName: data.name,
        Email: (data.email || "").trim(),
        phoneNumber: data.phone,
        Zip_code: data.zip,
        firstName,
        lastName,
        city,
        state,
        ip_address: serverIp,
        os,
        browser,
        utm_source: typeof window !== "undefined" ? window.location.href : "",
        landing_page: serviceData?.title || "Service page",
        xxTrustedFormCertUrl: "",
        honeypot: "",
        honeypot_field_name: "website",
        phone_validation_status: phoneValidation.status,
        phone_activity_score: phoneValidation.score,
        phone_line_type: phoneValidation.lineType,
      };

      syncHiddenFields(basePayload);

      const { error } = await supabase.from(table).insert([basePayload]).select();

      if (error) {
        toast({
          title: "Submission Error",
          description: "There was an error submitting your form. Please try again.",
        });
        return;
      }

      toast({
        title: "Form Submitted",
        description: "Your form has been successfully submitted.",
        duration: 2000,
      });

      if (leadEmail) {
        const skip = new Set([
          "honeypot",
          "honeypot_field_name",
          "phone_validation_status",
          "phone_activity_score",
          "phone_line_type",
        ]);
        let emailMessage = "A new service request has been submitted:\n\n";
        emailMessage += `Full Name: ${data.name}\n`;
        emailMessage += `Email: ${data.email}\n`;
        emailMessage += `Phone: ${data.phone}\n`;
        emailMessage += `Zip Code: ${data.zip}\n`;
        Object.entries(basePayload).forEach(([key, value]) => {
          if (
            skip.has(key) ||
            ["fullName", "Email", "phoneNumber", "Zip_code", "firstName", "lastName"].includes(key)
          ) {
            return;
          }
          emailMessage += `${key}: ${String(value ?? "")}\n`;
        });
        emailMessage += `Product: ${product}\n`;
        await sendEmails(leadEmail, "New Service Request Submitted", emailMessage);
      }

      try {
        posthog.capture("form_submit", {
          form_id: serviceData?.form_id || "lead-form",
          client_id: companyName || undefined,
          service,
          zip_code: data.zip,
          success: true,
        });
      } catch {
        // non-critical
      }

      setThankYouPartnerDisplay(
        companyName.trim() || serviceData?.title?.trim() || "your local estimator",
      );
      setSubmitted({ ...data, email: data.email });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSelectRadio = (q: WizardCmsRadioQuestion, option: string) => {
    setAnswers((prev) => ({ ...prev, [q.name]: option }));
    const wm = q.warningMessage;
    if (wm?.buttons && warningMatches(wm, option)) {
      setPendingWarning({ questionName: q.name, message: wm.message });
      return;
    }
    setPendingWarning(null);
    setTimeout(next, 200);
  };

  /** Explicit Continue (shown on every radio step) — same guardrails as picking an option */
  const continueRadioStep = (q: WizardCmsRadioQuestion) => {
    const selected = answers[q.name]?.trim();
    if (!selected) return;
    if (pendingWarning?.questionName === q.name) {
      setPendingWarning(null);
      next();
      return;
    }
    const wm = q.warningMessage;
    if (wm?.buttons && warningMatches(wm, selected)) {
      setPendingWarning({ questionName: q.name, message: wm.message });
      return;
    }
    setPendingWarning(null);
    next();
  };

  /* ── CMS radio steps ── */
  if (step < cmsQuestions.length) {
    const s = cmsQuestions[step];
    const opts = s.options;
    const showWarningHere = pendingWarning?.questionName === s.name;

    return (
      <section className="mx-auto max-w-[1180px] px-4 -mt-20">
        <div className={cn(wizTw.card, "relative z-[99] flex flex-col gap-[14px] p-[18px]")}>
          <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />
          <input
            id="hp_website"
            name="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className={cn(wizTw.pill, wizTw.pillCream)}>
                Step {step + 1} of {total}
              </span>
              <span className="text-[11px] font-semibold text-[var(--ink-mute)]">~30 sec · 100% free</span>
            </div>
            <div className={wizTw.wizProgress}>
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={cn(wizTw.wizStep, i <= step && wizTw.wizStepActive)}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className={cn(wizTw.display, "m-0 mb-1 text-[22px] text-[var(--navy)]")}>{s.title}</h3>
            <p className="m-0 text-[13px] text-[var(--ink-soft)]">Pick the closest match.</p>
          </div>

          {!showWarningHere ? (
            <div className="grid grid-cols-2 gap-2">
              {opts.map((option) => {
                const materialIconSrc = getMaterialOptionIconSrc(option);
                return (
                  <button
                    key={option}
                    type="button"
                    className={cn(
                      wizTw.wizOption,
                      answers[s.name] === option && wizTw.wizOptionSelected,
                    )}
                    onClick={() => onSelectRadio(s, option)}
                  >
                    <span
                      className={cn(
                        wizTw.wizOptionIcon,
                        answers[s.name] === option ? wizTw.wizOptionIconSelected : wizTw.wizOptionIconIdle,
                      )}
                    >
                      {materialIconSrc ? (
                        <img
                          src={materialIconSrc}
                          alt=""
                          width={48}
                          height={48}
                          className="block size-10 object-contain"
                          aria-hidden
                        />
                      ) : (
                        ""
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col gap-px">
                      <span className="text-[14px] sm:text-xl font-bold leading-tight">{option}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-2">
              <p className="mb-3 text-sm leading-snug text-[var(--ink-soft)]">
                {pendingWarning?.message}
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  className={cn(wizTw.btn, wizTw.btnGhost, "px-3.5 py-2 text-[13px]")}
                  onClick={() => {
                    setAnswers((prev) => {
                      const n = { ...prev };
                      delete n[s.name];
                      return n;
                    });
                    setPendingWarning(null);
                  }}
                >
                  Change answer
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 text-xs">
            <button
              type="button"
              className={cn(wizTw.btn, wizTw.btnGhost, "px-3.5 py-2 text-[13px] disabled:opacity-40")}
              onClick={back}
              disabled={step === 0}
            >
              ← Back
            </button>
            <button
              type="button"
              className={cn(
                wizTw.btn,
                wizTw.btnYellow,
                "px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40",
              )}
              disabled={!answers[s.name]?.trim()}
              onClick={() => continueRadioStep(s)}
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    );
  }

  const neuDisclaimer =
    (serviceData as { neuMediaText?: string } | undefined)?.neuMediaText ||
    "Neu Media Group, the operator of this website, and/or our local partner will contact you via a call, text, or email using manual or automated technology at the telephone number provided, including your wireless number, to arrange a convenient time to do an in-home estimate for you. You understand that your consent is not required to purchase products or services, and you understand that you may revoke your consent at any time.";

  /* ── Name + email ── */
  if (step === identityStepIndex) {
    const nameErrMsg = getFullNameValidationMessage(data.name);
    const emailErrMsg = getEmailValidationMessage(data.email || "");
    const showNameErr =
      nameErrMsg !== null &&
      (identityShowErrors || nameBlurred || data.name.trim().length > 0);
    const showEmailErr =
      emailErrMsg !== null &&
      (identityShowErrors || emailBlurred || (data.email || "").trim().length > 0);

    const hiddenInputs = (
      <>
        <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />
        <input
          id="hp_website"
          name="website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute -left-[9999px] w-px h-px opacity-0 pointer-events-none"
        />
      </>
    );

    return (
      <section className="mx-auto max-w-[1180px] px-4 -mt-20">
        <div className={cn(wizTw.card, "relative z-[99] flex flex-col gap-[14px] p-[18px]")}>
          {hiddenInputs}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className={cn(wizTw.pill, wizTw.pillCream)}>
                Step {identityStepIndex + 1} of {total}
              </span>
              <span className="text-[11px] font-semibold text-[var(--ink-mute)]">~30 sec · 100% free</span>
            </div>
            <div className={wizTw.wizProgress}>
              {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={cn(wizTw.wizStep, i <= step && wizTw.wizStepActive)} />
              ))}
            </div>
          </div>
          <div>
            <h3 className={cn(wizTw.display, "m-0 mb-1 text-[22px] text-[var(--navy)]")}>
              Where should we send your quote?
            </h3>
            <p className="m-0 text-[13px] text-[var(--ink-soft)]">
              A local specialist will call within 24 hours.
            </p>
          </div>
          <div className="grid gap-2">
            <input
              className={wizTw.input}
              placeholder="Full name"
              autoComplete="name"
              aria-label="Full name"
              value={data.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => setNameBlurred(true)}
              aria-invalid={showNameErr}
              aria-describedby={showNameErr ? "wizard-name-error" : "wizard-name-hint"}
              data-ph-no-capture
            />
            {showNameErr && nameErrMsg && (
              <p id="wizard-name-error" role="alert" className="-mt-1 m-0 text-[13px] text-[#c0392b]">
                {nameErrMsg}
              </p>
            )}
            {!showNameErr ? (
              <p id="wizard-name-hint" className="-mt-1 m-0 text-[11px] text-[var(--ink-mute)]">
                Include your first and last name.
              </p>
            ) : null}

            <input
              className={wizTw.input}
              type="email"
              placeholder="Email address"
              autoComplete="email"
              aria-label="Email address"
              value={data.email || ""}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => setEmailBlurred(true)}
              aria-invalid={showEmailErr}
              aria-describedby={showEmailErr ? "wizard-email-error" : "wizard-email-hint"}
              data-ph-no-capture
            />
            {showEmailErr && emailErrMsg && (
              <p id="wizard-email-error" role="alert" className="-mt-1 m-0 text-[13px] text-[#c0392b]">
                {emailErrMsg}
              </p>
            )}
            {!showEmailErr ? (
              <p id="wizard-email-hint" className="-mt-1 m-0 text-[11px] text-[var(--ink-mute)]">
                We&apos;ll use this email for updates about your estimate.
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className={cn(wizTw.btn, wizTw.btnGhost, "px-3.5 py-2 text-[13px]")}
              onClick={back}
            >
              ← Back
            </button>
            <button
              type="button"
              className={cn(wizTw.btn, wizTw.btnYellow, "px-5 py-3 text-sm font-bold")}
              onClick={() => {
                if (!identityStepValid(data.name, data.email || "")) {
                  setIdentityShowErrors(true);
                  return;
                }
                setIdentityShowErrors(false);
                next();
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ── ZIP + phone + submit (last step) ── */
  const phoneSubmitValid =
    PHONE_REGEX.test(data.phone.trim()) &&
    phoneValidation.status !== "verifying" &&
    data.zip.length === 5 &&
    (!hasZipTable || (zipMatched && validatedZipKey === data.zip));

  return (
    <section className="mx-auto max-w-[1180px] px-4 -mt-20">
      <div className={cn(wizTw.card, "relative flex flex-col gap-[14px] p-[18px]")}>
        <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />
        <input
          id="hp_website"
          name="website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className={cn(wizTw.pill, wizTw.pillGreen)}>✓ Almost done</span>
            <span className="text-[11px] font-semibold text-[var(--ink-mute)]">
              Step {contactStepIndex + 1} of {total}
            </span>
          </div>
          <div className={wizTw.wizProgress}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className={cn(wizTw.wizStep, i <= step && wizTw.wizStepActive)} />
            ))}
          </div>
        </div>
        <div>
          <h3 className={cn(wizTw.display, "m-0 mb-1 text-[22px] text-[var(--navy)]")}>ZIP & phone</h3>
          <p className="m-0 text-[13px] text-[var(--ink-soft)]">
            Confirm your ZIP for availability and a number where we can reach you about your estimate.
          </p>
        </div>
        <div className="grid gap-2">
          <input
            className={wizTw.input}
            inputMode="numeric"
            maxLength={5}
            placeholder="ZIP code"
            autoComplete="postal-code"
            aria-label="ZIP code"
            value={data.zip}
            onChange={(e) => set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
          />
          {zipLoading && (
            <p className="m-0 text-xs text-[var(--ink-mute)]">Checking ZIP…</p>
          )}
          {!zipLoading && zipError && (
            <p className="m-0 text-[13px] text-[#c0392b]">{zipError}</p>
          )}
          {!zipLoading && zipMatched && hasZipTable && validatedZipRow && (
            <p className="m-0 text-[13px] font-semibold text-[#28a745]">
              {validatedZipRow.City}, {validatedZipRow.State}
            </p>
          )}
          {!zipLoading && !zipError && data.zip.length > 0 && data.zip.length < 5 && (
            <p className="m-0 text-[11px] text-[var(--ink-mute)]">Enter all 5 digits</p>
          )}
          <input
            className={wizTw.input}
            type="tel"
            placeholder="Phone number"
            autoComplete="tel"
            inputMode="tel"
            aria-label="Phone number"
            value={data.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            data-ph-no-capture
          />
          <div>
            {phoneValidation.status === "verifying" && (
              <p className="m-0 text-xs text-[var(--ink-mute)]">Verifying…</p>
            )}
            {phoneValidation.status === "pass" && (
              <p className="m-0 text-xs text-[#28a745]">
                Verified number confirmed. We&apos;ll text or call you to schedule your appointment
                time.
              </p>
            )}
            {phoneValidation.status === "fail" && (
              <p className="m-0 text-xs text-amber-700">
                We couldn&apos;t verify this number, but you can still submit your request.
              </p>
            )}
          </div>
          <p className="m-0 text-[10px] leading-snug text-[var(--ink-mute)]">{neuDisclaimer}</p>
        </div>
        <button
          type="button"
          className={cn(wizTw.btn, wizTw.btnYellow, wizTw.btnLg, wizTw.btnBlock)}
          onClick={() => void submitLead()}
          disabled={isSubmitting || !phoneSubmitValid}
        >
          {isSubmitting ? "Submitting..." : "Get my free quote →"}
        </button>
        <div className="flex justify-center gap-3 text-[11px] text-[var(--ink-mute)]">
          <span>🔒 SSL secured</span>
          <span>·</span>
          <span>No spam</span>
          <span>·</span>
          <span>0% APR avail</span>
        </div>
        <button
          type="button"
          className={cn(wizTw.btn, wizTw.btnGhost, "mt-1 self-start px-3.5 py-2 text-[13px]")}
          onClick={back}
        >
          ← Back
        </button>
      </div>
    </section>
  );
}
