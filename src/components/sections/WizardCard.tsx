"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { isBlockedSubmission, logSubmission } from "@/lib/checkSpamSubmission";
import { getMaterialOptionIconSrc } from "@/lib/material-option-icons";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ── Props ──────────────────────────────────────────────────────────────────────

interface WizardCardProps {
  /** From `getServicesBySlug`. Omit on local `/test` to use demo questions only. */
  serviceData?: ServiceData | null;
  service?: string;
  initialUserCity?: string;
  initialUserState?: string;
  variant?: string;
}

// ── Tailwind class map ─────────────────────────────────────────────────────────

/**
 * Tailwind mapping of wizard + form styles from `src/app/test/test.css`
 * (.card, .display, .btn*, .input, .pill*, .wiz-*).
 */
const wizTw = {
  card: "rounded-xl border border-[var(--line-soft)] bg-white [box-shadow:var(--shadow-sm)] ",
  display:
    "[font-family:var(--font-display),var(--font-inter),sans-serif] font-bold tracking-[-0.025em] leading-[1.05]",

  pill: "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.02em]",
  pillCream: "bg-[var(--cream-warm)] text-[var(--navy)]",
  pillGreen: "bg-[var(--green-soft)] text-[var(--green)]",

  wizProgress: "flex gap-1 max-w-[300px] mx-auto transition-[width] duration-300 ease-out",
  wizStep: "h-2 flex-1  transition-colors duration-300 border-2 border-green-700 rounded-xl",
  wizStepActive: "bg-green-700",

  wizOption:
    "flex flex-col  h-full w-full cursor-pointer items-center justify-center rounded-md border-2 border-[var(--line)] bg-white px-3.5 py-3.5 text-left font-inherit text-sm text-[var(--ink)] transition-all duration-100 active:scale-[0.98] hover:border-[var(--navy)]",
  wizOptionSelected: "border-[var(--navy)] bg-[var(--cream-warm)]",

  wizOptionIcon: "grid shrink-0 place-items-center rounded-[10px] text-lg font-bold text-[var(--navy)]",
  wizOptionIconIdle: "bg-[var(--cream-warms)]",
  wizOptionIconSelected: "bg-[var(--yellow)]",

  input:
    "w-full rounded-md border-2 border-[var(--line)] bg-white px-4 py-3 font-inherit text-sm text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-100 focus:border-[var(--navy)] focus:shadow-[0_0_0_4px_rgba(14,42,74,0.12)]",

  btn: "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border-none px-[22px] py-[14px] font-inherit text-[15px] font-bold no-underline transition-[transform,box-shadow,background] duration-100",
  btnYellow:
    "bg-[#55BC7E] text-white active:translate-y-0.5 active:shadow-[0_2px_0_#388E5A]",
  btnGhost:
    "border-[1.5px] border-solid border-[var(--navy)] bg-transparent text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white",
  btnLg: "rounded-md px-[26px] py-[18px] text-base",
  btnBlock: "w-full",
} as const;

// ── Constants ──────────────────────────────────────────────────────────────────

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

// ── Validation helpers ─────────────────────────────────────────────────────────

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

function getPhoneValidationMessage(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!phone.trim()) return "Phone number is required";
  if (digits.length >= 10 && !PHONE_REGEX.test(phone.trim()))
    return "Enter a valid 10-digit  phone number — e.g. (000)123-4567";
  return null;
}

function warningMatches(
  condition: WizardCmsRadioQuestion["warningMessage"],
  selection: string,
) {
  if (!condition?.condition) return false;
  const c = condition.condition;
  return Array.isArray(c) ? c.includes(selection) : selection === c;
}

// ── Pure utilities (no component state) ───────────────────────────────────────

function detectClientInfo() {
  const ua = navigator.userAgent;
  let os = "Unknown OS";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac/i.test(ua)) os = "MacOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";

  let browser = "Unknown Browser";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/firefox/i.test(ua)) browser = "Firefox";

  return { os, browser };
}

function syncHiddenFields(formValues: Record<string, unknown>) {
  const tfInput = document.getElementById("xxTrustedFormCertUrl") as HTMLInputElement | null;
  const tfValue = tfInput?.value;
  if (tfValue) formValues.xxTrustedFormCertUrl = tfValue;
  const hpInput = document.getElementById("hp_website") as HTMLInputElement | null;
  formValues.honeypot = hpInput?.value || "";
  formValues.honeypot_field_name = "website";
  return formValues;
}

async function sendEmails(recipientEmails: string, subject: string, message: string) {
  const emailList = recipientEmails.split(",").map((e) => e.trim()).filter(Boolean);
  await Promise.all(
    emailList.map((email) =>
      fetch("/api/sendEmail", {
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
}

function applyZipRowToLead(
  row: ServiceZipRow | null,
  initialUserCity?: string,
  initialUserState?: string,
): { city?: string; state?: string; companyName: string; leadEmail: string; product: string } {
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
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function HiddenAntiSpamInputs() {
  return (
    <>
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
    </>
  );
}

function WizardProgressBar({ total, currentStep }: { total: number; currentStep: number }) {
  return (
    <div className={wizTw.wizProgress}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={cn(wizTw.wizStep, i <= currentStep && wizTw.wizStepActive)} />
      ))}
    </div>
  );
}

// ── Step view components ───────────────────────────────────────────────────────

interface RadioStepViewProps {
  step: number;
  total: number;
  question: WizardCmsRadioQuestion;
  answers: Record<string, string>;
  pendingWarning: { questionName: string; message: string } | null;
  onSelect: (option: string) => void;
  onClearAnswer: () => void;
  onBack: () => void;
  onContinue: () => void;
}

function RadioStepView({
  step,
  total,
  question,
  answers,
  pendingWarning,
  onSelect,
  onClearAnswer,
  onBack,
  onContinue,
}: RadioStepViewProps) {
  const showWarning = pendingWarning?.questionName === question.name;
  const selected = answers[question.name];

  return (
    <section className="mx-auto max-w-[900px] px-4 -mt-20">
      <div className={cn(wizTw.card, "relative z-[99] flex flex-col gap-[14px] p-[18px]  justify-start items-center w-full")}>

        <div className="w-full">
          <div className="mb-2 flex items-center justify-center">
            <span className="font-bold mb-2">
              Step {step + 1} of {total}
            </span>
          </div>
          <WizardProgressBar total={total} currentStep={step} />
        </div>

        <div className="text-center">
          <h3 className={cn(wizTw.display, "m-0 mb-1 text-[22px] text-[var(--navy)]")}>
            {question.title}
          </h3>
          {/* <p className="m-0 text-[13px] text-[var(--ink-soft)]">Pick the closest match.</p> */}
        </div>

        {showWarning ? (
          <div className="py-2 text-center">
            <p className="mb-3 text-sm leading-snug text-red-700">
              {pendingWarning?.message}
            </p>
            <div className="flex flex-wrap gap-2.5 w-full justify-center">
              <button
                type="button"
                className={cn(wizTw.btn, wizTw.btnGhost, "px-3.5 py-2 text-[13px]")}
                onClick={onClearAnswer}
              >
                Change answer
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2  gap-2 w-full content-center items-center justify-center text-center">
            {question.options.map((option) => {
              const materialIconSrc = getMaterialOptionIconSrc(option);
              return (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    wizTw.wizOption,
                    selected === option && wizTw.wizOptionSelected,
                  )}
                  onClick={() => onSelect(option)}
                >
                  <span
                    className={cn(
                      wizTw.wizOptionIcon,
                      selected === option ? "" : wizTw.wizOptionIconIdle,
                    )}
                  >
                    {materialIconSrc ? (
                      <img
                        src={materialIconSrc}
                        alt="icons"
                        width={1000}
                        height={1000}
                        className="object-contain max-w-[80px] max-h-[80px] md:max-w-[100px] md:max-h-[100px] lg:max-w-[120px] lg:max-h-[120px]"
                        aria-hidden
                      />
                    ) : (
                      ""
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col gap-px text-center mt-1">
                    <span className="text-[14px] sm:text-xl font-bold leading-tight">{option}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 text-xs w-full">
          <button
            type="button"
            className={cn(wizTw.btn, wizTw.btnGhost, "px-5 py-3 text-[13px] disabled:opacity-40")}
            onClick={onBack}
            disabled={step === 0}
          >
            Back
          </button>
          <button
            type="button"
            className={cn(
              wizTw.btn,
              wizTw.btnYellow,
              "px-6 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40",
            )}
            disabled={!selected?.trim()}
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </section>
  );
}

interface CombinedStepViewProps {
  step: number;
  total: number;
  name: string;
  email: string;
  nameError: string | null;
  emailError: string | null;
  showNameError: boolean;
  showEmailError: boolean;
  zip: string;
  phone: string;
  zipLoading: boolean;
  zipError: string;
  zipMatched: boolean;
  validatedZipRow: ServiceZipRow | null;
  hasZipTable: boolean;
  phoneValidation: { status: "idle" | "verifying" | "pass" | "fail"; score?: number; lineType?: string };
  isSubmitting: boolean;
  submitValid: boolean;
  neuDisclaimer: string;
  phoneError: string | null;
  showPhoneError: boolean;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onNameBlur: () => void;
  onEmailBlur: () => void;
  onPhoneBlur: () => void;
  onZipChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

function CombinedStepView({
  step,
  total,
  name,
  email,
  nameError,
  emailError,
  showNameError,
  showEmailError,
  zip,
  phone,
  zipLoading,
  zipError,
  zipMatched,
  validatedZipRow,
  hasZipTable,
  phoneValidation,
  phoneError,
  showPhoneError,
  isSubmitting,
  submitValid,
  neuDisclaimer,
  onNameChange,
  onEmailChange,
  onNameBlur,
  onEmailBlur,
  onPhoneBlur,
  onZipChange,
  onPhoneChange,
  onBack,
  onSubmit,
}: CombinedStepViewProps) {
  const phoneDigits = phone.replace(/\D/g, "").length;
  return (
    <section className="mx-auto max-w-[880px] px-4 -mt-20">
      <div className={cn(wizTw.card, "relative flex flex-col gap-[14px] p-[18px]")}>

        <div className="w-full">
          <div className="mb-2 flex items-center justify-center">
            <span className="font-bold mb-2">
              Step {step + 1} of {total}
            </span>
          </div>
          <WizardProgressBar total={total} currentStep={step} />
        </div>

        <div className="text-center">
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
            placeholder="Full name*"
            autoComplete="name"
            aria-label="Full name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={onNameBlur}
            aria-invalid={showNameError}
            aria-describedby={showNameError ? "wizard-name-error" : "wizard-name-hint"}
            data-ph-no-capture
          />
          {showNameError && nameError && (
            <p id="wizard-name-error" role="alert" className="-mt-1 m-0 text-[13px] text-[#c0392b]">
              {nameError}
            </p>
          )}
          {!showNameError ? (
            <p id="wizard-name-hint" className="-mt-1 m-0 text-[11px] text-[var(--ink-mute)]">
              Include your first and last name.
            </p>
          ) : null}

          <input
            className={wizTw.input}
            type="email"
            placeholder="Email address*"
            autoComplete="email"
            aria-label="Email address"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={onEmailBlur}
            aria-invalid={showEmailError}
            aria-describedby={showEmailError ? "wizard-email-error" : "wizard-email-hint"}
            data-ph-no-capture
          />
          {showEmailError && emailError && (
            <p id="wizard-email-error" role="alert" className="-mt-1 m-0 text-[13px] text-[#c0392b]">
              {emailError}
            </p>
          )}
          {!showEmailError ? (
            <p id="wizard-email-hint" className="-mt-1 m-0 text-[11px] text-[var(--ink-mute)]">
              We&apos;ll use this email for updates about your estimate.
            </p>
          ) : null}

          <input
            className={wizTw.input}
            inputMode="numeric"
            maxLength={5}
            placeholder="ZIP code*"
            autoComplete="postal-code"
            aria-label="ZIP code"
            value={zip}
            onChange={(e) => onZipChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
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
          {!zipLoading && !zipError && zip.length > 0 && zip.length < 5 && (
            <p className="m-0 text-[11px] text-[var(--ink-mute)]">Enter all 5 digits</p>
          )}

          <input
            className={wizTw.input}
            type="tel"
            placeholder="(555)123-4567"
            autoComplete="tel"
            inputMode="tel"
            aria-label="Phone number"
            aria-invalid={showPhoneError}
            aria-describedby={showPhoneError ? "wizard-phone-error" : "wizard-phone-hint"}
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            onBlur={onPhoneBlur}
            data-ph-no-capture
          />
          {/* Format hint when empty */}
          {phoneDigits === 0 && !showPhoneError && (
            <p id="wizard-phone-hint" className="-mt-1 m-0 text-[11px] text-[var(--ink-mute)]">
              Format: (000)123-4567 — 10 digits
            </p>
          )}
          {/* Partial progress hint */}
          {phoneDigits > 0 && phoneDigits < 10 && (
            <p className="-mt-1 m-0 text-[12px] text-amber-600">
              {10 - phoneDigits} more digit{10 - phoneDigits !== 1 ? "s" : ""} needed
            </p>
          )}
          {/* Validation error */}
          {showPhoneError && phoneError && (
            <p id="wizard-phone-error" role="alert" className="-mt-1 m-0 text-[13px] text-[#c0392b]">
              {phoneError}
            </p>
          )}
          {/* Verification status */}
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
          className={cn(
            wizTw.btn,
            wizTw.btnLg,
            wizTw.btnBlock,
            isSubmitting
              ? cn(wizTw.btnYellow, "cursor-wait opacity-90")
              : submitValid
                ? cn(wizTw.btnYellow, "shadow-[0_4px_0_#388E5A] hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_#388E5A]")
                : "cursor-not-allowed bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300"
          )}
          onClick={onSubmit}
          disabled={isSubmitting || !submitValid}
          aria-disabled={isSubmitting || !submitValid}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Submitting…
            </span>
          ) : !submitValid ? (
            <span className="flex items-center justify-center gap-2">

              Get my free quote →
            </span>
          ) : (
            "Get my free quote →"
          )}
        </button>

        <div className="flex justify-center gap-3 text-[10px] text-[var(--ink-mute)]">
          <span>🔒 SSL secured</span>
          <span>·</span>
          <span>No spam</span>
          <span>·</span>
          <span>0% APR avail</span>
        </div>

        <button
          type="button"
          className={cn(wizTw.btn, wizTw.btnGhost, "mt-1 self-start px-3.5 py-2 text-[13px]")}
          onClick={onBack}
        >
          ← Back
        </button>
      </div>
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function WizardCard({
  serviceData,
  service: serviceProp,
  initialUserCity,
  initialUserState,
  variant,
}: WizardCardProps) {
  const { toast } = useToast();

  const service = serviceProp ?? serviceData?.slug ?? "demo";

  // ── CMS question data ────────────────────────────────────────────────────

  const fromCms = useMemo(
    () => normalizeWizardRadioQuestionsFromCms(serviceData?.questions, serviceData?.openingWizard),
    [serviceData?.questions, serviceData?.openingWizard]
  );
  /** Demo steps when no Payload doc (`/test`); CMS payload drives production. */
  const cmsQuestions = useMemo(
    () => (serviceData ? fromCms : fromCms.length > 0 ? fromCms : DEMO_RADIO_QUESTIONS),
    [serviceData, fromCms]
  );

  /** After CMS radios: name/email → ZIP + phone + submit together (last). */
  const identityStepIndex = cmsQuestions.length;
  const total = cmsQuestions.length + 1;

  // ── Wizard state ─────────────────────────────────────────────────────────

  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(initial);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingWarning, setPendingWarning] = useState<{
    questionName: string;
    message: string;
  } | null>(null);

  // ── ZIP validation state ─────────────────────────────────────────────────

  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");
  const [zipMatched, setZipMatched] = useState(false);
  const [validatedZipRow, setValidatedZipRow] = useState<ServiceZipRow | null>(null);
  const [validatedZipKey, setValidatedZipKey] = useState("");

  // ── Phone validation state ───────────────────────────────────────────────

  /** Same `/api/validate-phone` usage as SubmitForm (`validatePhoneInline`). */
  const [phoneValidation, setPhoneValidation] = useState<{
    status: "idle" | "verifying" | "pass" | "fail";
    score?: number;
    lineType?: string;
  }>({ status: "idle" });

  // ── Identity step error display state ────────────────────────────────────

  /** Show name/email/phone validation under fields after blur, typing, or failed Continue. */
  const [nameBlurred, setNameBlurred] = useState(false);
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [phoneBlurred, setPhoneBlurred] = useState(false);
  const [identityShowErrors, setIdentityShowErrors] = useState(false);

  // ── Intent tracking ──────────────────────────────────────────────────────

  const intentFiredRef = useRef(false);
  const submitGuardRef = useRef(false);
  const intentSessionKey = `wizard_form_intent_${service}`;

  const fireFormIntent = () => {
    if (intentFiredRef.current) return;
    try {
      if (sessionStorage.getItem(intentSessionKey)) return;
      sessionStorage.setItem(intentSessionKey, "1");
    } catch {
      // sessionStorage unavailable — still fire via ref guard
    }
    intentFiredRef.current = true;
    try {
      posthog.capture("form_intent", {
        form_id: serviceData?.form_id || "lead-form",
        service,
        variant: variant || undefined,
      });
    } catch {
      // non-critical
    }
  };

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (step === identityStepIndex) return;
    setNameBlurred(false);
    setEmailBlurred(false);
    setPhoneBlurred(false);
    setIdentityShowErrors(false);
  }, [step, identityStepIndex]);

  const hasZipTable =
    !!serviceData?.zipCodes && typeof serviceData.zipCodes === "string";

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
          posthog.capture("zip_not_serviced", { zip_code: z, service, location: "wizard" });
        } catch {
          // non-critical
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data.zip, service, hasZipTable, serviceData?.zipCodes]);

  // ── Navigation helpers ───────────────────────────────────────────────────

  const set = <K extends keyof WizardData>(k: K, v: WizardData[K]) =>
    setData((d) => ({ ...d, [k]: v }));
  const next = () => setStep((s) => Math.min(total - 1, s + 1));
  const back = () => {
    setPendingWarning(null);
    setStep((s) => Math.max(0, s - 1));
  };

  // ── Phone handlers ───────────────────────────────────────────────────────

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
      setPhoneValidation({
        status: j?.is_valid ? "pass" : "fail",
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

  // ── Radio step handlers ──────────────────────────────────────────────────

  const onSelectRadio = (q: WizardCmsRadioQuestion, option: string) => {
    fireFormIntent();
    setAnswers((prev) => ({ ...prev, [q.name]: option }));
    const wm = q.warningMessage;
    if (wm?.buttons && warningMatches(wm, option)) {
      setPendingWarning({ questionName: q.name, message: wm.message });
      return;
    }
    setPendingWarning(null);
    setTimeout(next, 200);
  };

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

  // ── Lead submission ──────────────────────────────────────────────────────

  const submitLead = async () => {
    if (submitGuardRef.current) return;
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
      const { companyName } = applyZipRowToLead(validatedZipRow, initialUserCity, initialUserState);
      const partnerDisplay = companyName.trim() || serviceData?.title?.trim() || "your local estimator";
      const returnUrl = typeof window !== "undefined" ? window.location.pathname : "/";
      sessionStorage.setItem("neu_ty", JSON.stringify({
        companyName: partnerDisplay,
        heroImage: typeof serviceData?.heroImage?.url === "string" ? serviceData.heroImage.url : "",
        contactPhone: typeof serviceData?.contactPhone === "string" ? serviceData.contactPhone : "",
        customerLogo: typeof serviceData?.customerLogo?.url === "string" ? serviceData.customerLogo.url : "",
        returnUrl,
      }));
      window.location.href = `/thank-you?s=${encodeURIComponent(service)}`;
      return;
    }

    submitGuardRef.current = true;
    setIsSubmitting(true);
    try {
      const { os, browser } = detectClientInfo();

      let serverIp = "";
      try {
        const res = await fetch("/api/getIP", { cache: "no-store" });
        if (res.ok) serverIp = (await res.json())?.ip ?? "";
      } catch {
        // non-critical
      }

      const blocked = await isBlockedSubmission(serverIp, data.email || "");
      if (blocked) {
        toast({
          title: "Already submitted",
          description: "We already received your request. Our team will be in touch soon.",
        });
        return;
      }

      let { city, state, companyName, leadEmail, product } = applyZipRowToLead(
        validatedZipRow,
        initialUserCity,
        initialUserState,
      );

      const rowMatches = hasZipTable && validatedZipRow && validatedZipKey === data.zip;
      if (hasZipTable && !rowMatches) {
        const { data: zipRows } = await supabase
          .from(serviceData!.zipCodes)
          .select(`City, State, Service, "Company name", "Lead Delivery Email"`)
          .eq("Zip_Code", data.zip)
          .eq("Service_Slug", service);
        const row = zipRows?.[0];
        const applied = applyZipRowToLead(row ?? null, initialUserCity, initialUserState);
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
        ...(variant ? { lp_variant: variant } : {}),
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

      void logSubmission(serverIp, data.email || "", service);

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
          variant: variant || undefined,
          lp_variant: variant || undefined,
          success: true,
        });
      } catch {
        // non-critical
      }

      const partnerDisplay = companyName.trim() || serviceData?.title?.trim() || "your local estimator";
      const returnUrl = typeof window !== "undefined" ? window.location.pathname : "/";
      sessionStorage.setItem("neu_ty", JSON.stringify({
        companyName: partnerDisplay,
        heroImage: typeof serviceData?.heroImage?.url === "string" ? serviceData.heroImage.url : "",
        contactPhone: typeof serviceData?.contactPhone === "string" ? serviceData.contactPhone : "",
        customerLogo: typeof serviceData?.customerLogo?.url === "string" ? serviceData.customerLogo.url : "",
        returnUrl,
      }));
      window.location.href = `/thank-you?s=${encodeURIComponent(service)}`;
    } finally {
      submitGuardRef.current = false;
      setIsSubmitting(false);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────

  const neuDisclaimer =
    (serviceData as { neuMediaText?: string } | undefined)?.neuMediaText ||
    "Neu Media Group, the operator of this website, and/or our local partner will contact you via a call, text, or email using manual or automated technology at the telephone number provided, including your wireless number, to arrange a convenient time to do an in-home estimate for you. You understand that your consent is not required to purchase products or services, and you understand that you may revoke your consent at any time.";

  const combinedSubmitValid =
    identityStepValid(data.name, data.email || "") &&
    PHONE_REGEX.test(data.phone.trim()) &&
    phoneValidation.status !== "verifying" &&
    data.zip.length === 5 &&
    (!hasZipTable || (zipMatched && validatedZipKey === data.zip));


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

  // ── Step routing ─────────────────────────────────────────────────────────

  const currentRadioQuestion = step < cmsQuestions.length ? cmsQuestions[step] : null;
  const nameErrMsg = getFullNameValidationMessage(data.name);
  const emailErrMsg = getEmailValidationMessage(data.email || "");
  const phoneErrMsg = getPhoneValidationMessage(data.phone);
  const showPhoneError = phoneErrMsg !== null && (identityShowErrors || phoneBlurred);

  return (
    // form wrapper required so TrustedForm's script detects and populates xxTrustedFormCertUrl
    <form onSubmit={(e) => e.preventDefault()}>
      <HiddenAntiSpamInputs />
      {currentRadioQuestion ? (
        <RadioStepView
          step={step}
          total={total}
          question={currentRadioQuestion}
          answers={answers}
          pendingWarning={pendingWarning}
          onSelect={(option) => onSelectRadio(currentRadioQuestion, option)}
          onClearAnswer={() => {
            setAnswers((prev) => {
              const n = { ...prev };
              delete n[currentRadioQuestion.name];
              return n;
            });
            setPendingWarning(null);
          }}
          onBack={back}
          onContinue={() => continueRadioStep(currentRadioQuestion)}
        />
      ) : (
        <CombinedStepView
          step={identityStepIndex}
          total={total}
          name={data.name}
          email={data.email || ""}
          nameError={nameErrMsg}
          emailError={emailErrMsg}
          showNameError={
            nameErrMsg !== null &&
            (identityShowErrors || nameBlurred || data.name.trim().length > 0)
          }
          showEmailError={
            emailErrMsg !== null &&
            (identityShowErrors || emailBlurred || (data.email || "").trim().length > 0)
          }
          zip={data.zip}
          phone={data.phone}
          zipLoading={zipLoading}
          zipError={zipError}
          zipMatched={zipMatched}
          validatedZipRow={validatedZipRow}
          hasZipTable={hasZipTable}
          phoneValidation={phoneValidation}
          isSubmitting={isSubmitting}
          submitValid={combinedSubmitValid}
          neuDisclaimer={neuDisclaimer}
          phoneError={phoneErrMsg}
          showPhoneError={showPhoneError}
          onNameChange={(v) => set("name", v)}
          onEmailChange={(v) => set("email", v)}
          onNameBlur={() => setNameBlurred(true)}
          onEmailBlur={() => setEmailBlurred(true)}
          onPhoneBlur={() => setPhoneBlurred(true)}
          onZipChange={(v) => set("zip", v)}
          onPhoneChange={handlePhoneChange}
          onBack={back}
          onSubmit={() => void submitLead()}
        />
      )}
    </form>
  );
}
