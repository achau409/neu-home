"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import posthog from "posthog-js";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/utils/supabase/client";
import { LockKeyhole } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import ThankYouModal from "./ThankYouModal";

type FieldType =
  | "radio"
  | "input"
  | "composite"
  | "checkbox"
  | "input-number"
  | "dropdown"
  | "string";

interface FormField {
  name: string;
  placeholder?: string;
  validation: z.ZodTypeAny;
  options?: string[];
}

interface Step {
  name: string;
  title: string;
  type: FieldType;
  subtitle?: string;
  placeholder?: string;
  options?: string[];
  fields?: FormField[];
  validation?: z.ZodTypeAny | { type: string; message?: string };
  warningMessage?: {
    condition: string | string[] | ((values: Record<string, unknown>) => boolean);
    message: string;
    buttons?: boolean;
  };
}

const COMMON_STEPS: Step[] = [
  {
    name: "fullName",
    title: "Who should I prepare this estimate for?",
    type: "composite",
    fields: [
      {
        name: "fullName",
        placeholder: "Full Name",
        validation: z
          .string()
          .regex(
            /^[a-zA-Z.]+ [a-zA-Z.]+.*$/,
            "Please enter your first and last name"
          )
          .min(1, "Full name is required"),
      },
      {
        name: "Email",
        placeholder: "Email Address",
        validation: z
          .string()
          .email("Invalid email format")
          .min(1, "Email is required"),
      },
    ],
  },
  {
    name: "phoneNumber",
    title: "What is your phone number?",
    subtitle: "A valid phone number is required to issue a formal estimate.",
    type: "input-number",
    validation: z
      .string()
      .regex(
        /^(\+1\s?)?(\(\d{3}\)\s?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/,
        "Phone number is Invalid"
      )
      .min(1, "Phone number is required"),
  },
];

interface SubmitFormProps {
  projectTitle: string;
  zipCode: string;
  companyName: string;
  targetEmail: string;
  zipLocation: { city: string; state: string } | null;
  projectId?: string | string[];
  service: string;
  questions: Step[];
  serviceData: Record<string, unknown>;
  product: string;
  onProgressChange?: (progress: number) => void;
  onStepChange?: (step: number, total: number) => void;
  persistedValues?: Record<string, string | string[]>;
  persistedStepIndex?: number;
  onPersistValuesChange?: (values: Record<string, string | string[]>) => void;
  onPersistStepIndexChange?: (stepIndex: number) => void;
  /** Called when user clicks Back on the first wizard step */
  onBackToZip?: () => void;
}

const SubmitForm = ({
  projectTitle,
  zipCode,
  targetEmail,
  zipLocation,
  companyName,
  service,
  questions,
  serviceData,
  product,
  onProgressChange,
  onStepChange,
  persistedValues,
  persistedStepIndex,
  onPersistValuesChange,
  onPersistStepIndexChange,
  onBackToZip,
}: SubmitFormProps) => {
  const [stepIndex, setStepIndex] = useState<number>(persistedStepIndex ?? 0);
  const { toast } = useToast();
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [submitInFlight, setSubmitInFlight] = useState(false);
  const [phoneValidation, setPhoneValidation] = useState<{
    status: "idle" | "verifying" | "pass" | "fail";
    score?: number;
    lineType?: string;
  }>({ status: "idle" });
  const [info, setInfo] = useState({ os: "", browser: "" });
  const [serverIp, setServerIp] = useState("");

  const allSteps = useMemo(() => [...questions, ...COMMON_STEPS], [questions]);
  const currentStep = allSteps[stepIndex];
  const isLastStep = stepIndex === allSteps.length - 1;

  useEffect(() => {
    const prog = allSteps.length > 1
      ? Math.round((stepIndex / (allSteps.length - 1)) * 100)
      : 0;
    onProgressChange?.(prog);
    onStepChange?.(stepIndex + 1, allSteps.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const handleBackStep = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    } else {
      onBackToZip?.();
    }
  };

  const buildSchema = (step: Step): z.ZodObject<Record<string, z.ZodTypeAny>> => {
    if (step.type === "composite" && step.fields) {
      const shape: Record<string, z.ZodTypeAny> = {};
      step.fields.forEach((field) => {
        shape[field.name] = field.validation;
      });
      return z.object(shape);
    }
    if (
      step.validation &&
      typeof step.validation === "object" &&
      "type" in step.validation &&
      (step.validation as { type: string }).type === "required"
    ) {
      return z.object({
        [step.name]: z.string().min(1, (step.validation as { message?: string }).message || "This field is required"),
      });
    }
    if (step.validation && step.validation instanceof z.ZodType) {
      return z.object({ [step.name]: step.validation });
    }
    return z.object({ [step.name]: z.string() });
  };

  const defaultValues = useMemo<Record<string, string | string[]>>(() => {
    const values: Record<string, string | string[]> = {};
    allSteps.forEach((step) => {
      if (step.type === "composite") {
        step.fields?.forEach((field) => {
          values[field.name] = "";
        });
      } else if (step.type === "checkbox") {
        values[step.name] = [];
      } else {
        values[step.name] = "";
      }
    });
    values.xxTrustedFormCertUrl = "";
    values.phone_validation_status = "";
    values.phone_activity_score = "";
    values.phone_line_type = "";
    values.honeypot = "";
    values.honeypot_field_name = "website";
    return {
      ...values,
      ...persistedValues,
    };
  }, [allSteps, persistedValues]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(buildSchema(currentStep)),
    defaultValues,
    mode: "onChange",
    shouldUnregister: false,
  });

  const values = watch();

  const currentStepFieldNames = useMemo(() => {
    if (currentStep.type === "composite") {
      return currentStep.fields?.map((field) => field.name) ?? [];
    }

    return [currentStep.name];
  }, [currentStep]);

  const isCurrentStepValid = useMemo(() => {
    const stepValues = currentStepFieldNames.reduce<Record<string, unknown>>((acc, fieldName) => {
      acc[fieldName] = values[fieldName];
      return acc;
    }, {});

    return buildSchema(currentStep).safeParse(stepValues).success;
  }, [buildSchema, currentStep, currentStepFieldNames, values]);

  useEffect(() => {
    const subscription = watch((formValues) => {
      onPersistValuesChange?.(formValues as Record<string, string | string[]>);
    });

    return () => subscription.unsubscribe();
  }, [onPersistValuesChange, watch]);

  useEffect(() => {
    onPersistStepIndexChange?.(stepIndex);
  }, [onPersistStepIndexChange, stepIndex]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const detectAndFetch = async () => {
      try {
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

        if (isMounted) setInfo({ os, browser });

        const response = await fetch("/api/getIP", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch IP");
        const data = await response.json();
        if (isMounted) setServerIp(data?.ip ?? "");
      } catch {
        // Silently ignore — non-critical metadata
      }
    };

    detectAndFetch();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

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
        setValue("phone_validation_status", "fail");
        return;
      }

      const data = await res.json();
      const validationStatus = data?.is_valid ? "pass" : "fail";

      setPhoneValidation({
        status: validationStatus,
        score: typeof data?.activity_score === "number" ? data.activity_score : undefined,
        lineType: typeof data?.line_type === "string" ? data.line_type : undefined,
      });

      setValue("phone_validation_status", validationStatus);
      if (data?.activity_score != null) setValue("phone_activity_score", String(data.activity_score));
      if (data?.line_type != null) setValue("phone_line_type", data.line_type);
    } catch {
      setPhoneValidation({ status: "fail" });
      setValue("phone_validation_status", "fail");
    }
  };

  const syncHiddenFields = (formValues: Record<string, unknown>) => {
    const tfInput = document.getElementById("xxTrustedFormCertUrl") as HTMLInputElement | null;
    const tfValue = tfInput?.value;
    if (tfValue && formValues.xxTrustedFormCertUrl !== tfValue) {
      formValues.xxTrustedFormCertUrl = tfValue;
    }
    const hpInput = document.getElementById("hp_website") as HTMLInputElement | null;
    formValues.honeypot = hpInput?.value || "";
    formValues.honeypot_field_name = "website";
    return formValues;
  };

  const sendEmails = async (recipientEmails: string, subject: string, message: string) => {
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
        }).catch((err) => console.error(`Failed to send email to ${email}:`, err))
      )
    );
  };

  const handleFormSubmit = async (formValues: Record<string, unknown>) => {
    if (stepIndex < allSteps.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    if (submitInFlight) return;
    setSubmitInFlight(true);

    // The per-step resolver only returns the current step's parsed fields.
    // Use the full form state here so earlier answers are preserved on final submit.
    const completeValues = getValues();
    const enrichedValues = syncHiddenFields({
      ...completeValues,
      ...formValues,
    });

    let firstName = "";
    let lastName = "";
    if (typeof enrichedValues.fullName === "string" && enrichedValues.fullName) {
      const nameParts = enrichedValues.fullName.trim().split(/\s+/);
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    }

    try {
      const { error } = await supabase
        .from(serviceData.serviceRequest as string)
        .insert([
          {
            ...enrichedValues,
            firstName,
            lastName,
            city: zipLocation?.city,
            state: zipLocation?.state,
            Zip_code: zipCode,
            ip_address: serverIp,
            os: info.os,
            browser: info.browser,
            utm_source: window.location.href,
            landing_page: projectTitle,
            phone_validation_status: phoneValidation.status,
            phone_activity_score: phoneValidation.score,
            phone_line_type: phoneValidation.lineType,
          },
        ])
        .select();

      if (error) {
        toast({
          title: "Submission Error",
          description: "There was an error submitting your form. Please try again.",
        });
      } else {
        toast({
          title: "Form Submitted",
          description: "Your form has been successfully submitted.",
          duration: 1000,
        });

        const commonFields = ["fullName", "Email", "phoneNumber"];
        const skipFields = new Set([
          "xxTrustedFormCertUrl", "honeypot", "honeypot_field_name",
          "phone_validation_status", "phone_activity_score", "phone_line_type",
        ]);

        let emailMessage = "A new service request has been submitted with the following details:\n\n";
        for (const key of commonFields) {
          if (enrichedValues[key]) {
            emailMessage += `${key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}: ${enrichedValues[key]}\n`;
          }
        }
        emailMessage += `Zip Code: ${zipCode}\n`;
        for (const key of Object.keys(enrichedValues)) {
          if (!commonFields.includes(key) && !skipFields.has(key)) {
            emailMessage += `${key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}: ${enrichedValues[key]}\n`;
          }
        }
        emailMessage += `Product: ${product}\n`;

        await sendEmails(targetEmail, "New Service Request Submitted", emailMessage);

        setShowThankYouModal(true);

        try {
          const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
          const slug = pathname.split("/").filter(Boolean)[0] || "";
          const expKey = slug ? `exp__${slug}__v1` : null;
          const match = (typeof document !== "undefined" ? document.cookie : "").match(
            new RegExp("(^| )ab_" + slug + "=([^;]+)")
          );
          const variant = match ? decodeURIComponent(match[2]) : undefined;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (posthog as any).capture(
            "form_submit",
            {
              form_id: (serviceData as Record<string, unknown>)?.form_id || "lead-form",
              client_id: companyName,
              path: pathname,
              experiment_key: expKey || undefined,
              variant,
              success: true,
              service,
              zip_code: zipCode,
            },
            { send_feature_flags: true }
          );
        } catch {
          // Non-critical analytics — silently ignore
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setSubmitInFlight(false);
    }
  };

  const renderStep = (step: Step) => {
    switch (step.type) {
      case "radio":
        return (
          <fieldset>
            <legend className="sr-only">{step.title}</legend>
            <Controller
              name={step.name}
              control={control}
              defaultValue={(getValues(step.name) as string) || ""}
              render={({ field }) => (
                <RadioGroup
                  aria-label={step.title}
                  className="flex flex-col items-center space-y-1 mt-4"
                  value={field.value as string}
                  onValueChange={field.onChange}
                >
                  {step.options?.map((option) => (
                    <div
                      key={option}
                      className={`flex items-center justify-between w-full max-w-sm border rounded-lg p-3 cursor-pointer ${field.value === option ? "border-[#28a745] bg-green-50" : "border-gray-300"
                        }`}
                      onClick={() => field.onChange(option)}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`h-6 w-6 rounded-full border-2 flex justify-center items-center ${field.value === option ? "border-[#28a745] bg-[#28a745]" : "border-gray-300"
                            }`}
                        >
                          {field.value === option && (
                            <div className="h-3 w-3 bg-white rounded-full" />
                          )}
                        </div>
                        <label className="text-base font-medium">{option}</label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />

            {step.warningMessage &&
              (Array.isArray(step.warningMessage.condition)
                ? step.warningMessage.condition.includes(values[step.name] as string)
                : values[step.name] === step.warningMessage.condition) && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-orange-600 mb-4">
                    {step.warningMessage.message.replace("{selection}", values[step.name] as string)}
                  </div>
                  {step.warningMessage.buttons && (
                    <div className="flex justify-center gap-4">
                      <Button type="button" variant="outline" className="w-24" onClick={() => setValue(step.name, "")}>
                        No
                      </Button>
                      <Button type="button" variant="default" className="w-24" onClick={() => handleSubmit(handleFormSubmit)()}>
                        Yes
                      </Button>
                    </div>
                  )}
                </div>
              )}
          </fieldset>
        );

      case "composite":
        return (
          <div className="w-full  mx-auto">
            {step.fields?.map((field) => (
              <div key={field.name}>
                <Input
                  {...register(field.name)}
                  aria-label={field.placeholder || field.name}
                  placeholder={field.placeholder}
                  className="mb-4 p-6 rounded-md placeholder:font-semibold"
                  {...(field.name === "fullName" || field.name === "Email"
                    ? { "data-ph-no-capture": true }
                    : {})}
                />
                {errors[field.name] && (
                  <p className="text-red-500 text-sm mb-2">
                    {(errors[field.name] as { message?: string })?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <fieldset className="flex flex-col items-center space-y-4 max-h-96 overflow-y-auto">
            <legend className="sr-only">{step.title}</legend>
            <Controller
              name={step.name}
              control={control}
              defaultValue={(getValues(step.name) as string[]) || []}
              render={({ field }) => (
                <>
                  {step.options?.map((option) => {
                    const checked = Array.isArray(field.value) && field.value.includes(option);
                    return (
                      <div
                        key={option}
                        className={`flex items-center justify-between w-full max-w-[300px] rounded-xl p-3 border-2 cursor-pointer transition-colors hover:border-green-300 ${checked ? "border-[#28a745] bg-green-50" : "border-gray-300"
                          }`}
                        onClick={() => {
                          const current = Array.isArray(field.value) ? field.value : [];
                          field.onChange(
                            checked ? current.filter((v: string) => v !== option) : [...current, option]
                          );
                        }}
                      >
                        <input type="checkbox" checked={checked} onChange={() => { }} className="hidden" />
                        <label>{option}</label>
                      </div>
                    );
                  })}
                </>
              )}
            />
          </fieldset>
        );

      case "input-number":
        return (
          <div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-2 w-full  mx-auto">
                <div className="relative w-full">
                  <Input
                    {...register(step.name)}
                    type="tel"
                    aria-label={step.title}
                    maxLength={10}
                    placeholder="Enter Your Phone Number"
                    className="p-6 pl-12 w-full rounded-md placeholder:font-semibold"
                    data-ph-no-capture
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const target = e.currentTarget;
                      const value = target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        target.value = value.replace(/(\d{3})(\d{3})(\d{4})/, "($1)$2-$3");
                      }
                    }}
                    onChange={(e) => {
                      register(step.name).onChange(e);
                      validatePhoneInline(e.target.value);
                    }}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <LockKeyhole size={20} strokeWidth={3} className="text-[#fa8c16]" />
                  </div>
                </div>
              </div>
              <div>
                {phoneValidation.status === "verifying" && (
                  <div className="text-xs text-gray-500">Verifying...</div>
                )}
                {phoneValidation.status === "pass" && (
                  <div className="text-xs text-green-600">
                    Verified number confirmed. We&apos;ll text or call you to schedule your appointment time.
                  </div>
                )}
                {phoneValidation.status === "fail" && (
                  <div className="text-xs text-amber-600">
                    We couldn&apos;t verify this number, but you can still submit your request.
                  </div>
                )}
              </div>
            </div>
            <p className="my-6 text-center text-[10px] text-gray-500 font-semibold">
              {(serviceData as Record<string, string>).neuMediaText ||
                "Neu Media Group, the operator of this website, and/or our local partner will contact you via a call, text, or email using manual or automated technology at the telephone number provided, including your wireless number, to arrange a convenient time to do an in-home estimate for you. You understand that your consent is not required to purchase products or services, and you understand that you may revoke your consent at any time."}
            </p>
          </div>
        );

      case "input":
        return (
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-2 w-full lg:w-1/2 mx-auto mt-4">
            <div className="relative w-full">
              <Input
                {...register(step.name)}
                aria-label={step.title}
                placeholder={step.placeholder || "Kitchen size"}
                className="p-6 pl-12 w-full rounded-md placeholder:font-semibold"
              />
            </div>
          </div>
        );

      case "dropdown":
        return (
          <div className="w-full mx-auto mt-4">
            <Controller
              name={step.name}
              control={control}
              defaultValue={(getValues(step.name) as string) || ""}
              render={({ field }) => (
                <Select value={(field.value as string) || ""} onValueChange={field.onChange}>
                  <SelectTrigger aria-label={step.title} className="w-full p-6 rounded-md">
                    <SelectValue placeholder={step.placeholder || "Select an option"} />
                  </SelectTrigger>
                  <SelectContent>
                    {step.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        );

      case "string":
        return (
          <div className="w-full mx-auto mt-4">
            <Input
              {...register(step.name)}
              type="text"
              aria-label={step.title}
              placeholder={step.placeholder || "Enter text"}
              className="mb-4 p-6 rounded-md placeholder:font-semibold"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex justify-center items-center w-full">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="max-w-lg w-full md:p-6 py-6 bg-white rounded-2xl relative overflow-hidden"
        >
          {/* TrustedForm hidden input */}
          <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />
          {/* Honeypot input (off-screen) */}
          <input
            id="hp_website"
            name="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute -left-[9999px] w-px h-px opacity-0 pointer-events-none"
          />

          <h2 className="text-2xl font-extrabold text-center mb-12 px-6 md:px-0">{currentStep.title}</h2>
          {currentStep.subtitle && (
            <h2 className="mb-6 text-center text-sm text-gray-500 font-semibold">
              {currentStep.subtitle}
            </h2>
          )}

          <div
            key={currentStep.name}
            className="text-center font-semibold max-w-md md:px-12 px-4 pb-[calc(7rem+env(safe-area-inset-bottom))]"
          >
            {renderStep(currentStep)}
            {currentStep.name !== "fullName" && errors[currentStep.name] && (
              <p className="text-red-500 text-sm mb-2">
                {(errors[currentStep.name] as { message?: string })?.message}
              </p>
            )}
          </div>

          {/* Persistent bottom action bar (mobile + desktop) */}
          <div className="fixed md:bottom-0 bottom-5 left-0 right-0 z-30 border-t border-gray-100 bg-white/95 px-4 md:py-10 py-6 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6">
            <div className="mx-auto flex max-w-md items-center justify-center gap-3">
              <Button
                type="button"
                onClick={handleBackStep}
                variant="outline"
                className="p-6 md:w-full border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="p-6 w-full bg-[#28a745] text-white hover:bg-[#22963c] disabled:bg-green-300 font-bold"
                disabled={
                  !isCurrentStepValid ||
                  submitInFlight ||
                  (isLastStep && phoneValidation.status === "verifying")
                }
              >
                {isLastStep ? "Submit my request" : "Next"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <ThankYouModal
        isOpen={showThankYouModal}
        setIsOpen={setShowThankYouModal}
        companyName={companyName}
        heroImage={(serviceData as Record<string, { url: string }>).heroImage?.url || ""}
        contactPhone={(serviceData as Record<string, string>).contactPhone || ""}
        service={service}
        customerLogo={(serviceData as Record<string, { url?: string }>).customerLogo?.url || ""}
      />
    </>
  );
};

export default SubmitForm;
