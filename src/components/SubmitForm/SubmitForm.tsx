"use client";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import {
  Formik,
  Form as FormikForm,
  Field,
  ErrorMessage,
  FormikProps,
} from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/utils/supabase/client";
import { LockKeyhole, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  validation: any;
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
  validation?: any;
  warningMessage?: {
    condition: string | string[] | ((values: any) => boolean);
    message: string;
    buttons?: boolean;
  };
}

// Common steps shared across all services----------------
const COMMON_STEPS: Step[] = [
  {
    name: "fullName",
    title: "Who should I prepare this estimate for?",
    type: "composite",
    fields: [
      {
        name: "fullName",
        placeholder: "Full Name",
        validation: Yup.string()
          .matches(
            /^[a-zA-Z.]+ [a-zA-Z.]+.*$/,
            "Please enter your first and last name"
          )
          .required("Full name is required"),
      },
      {
        name: "Email",
        placeholder: "Email Address",
        validation: Yup.string()
          .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Invalid email format"
          )
          .required("Email is required"),
      },
    ],
  },
  {
    name: "phoneNumber",
    title: "What is your phone number?",
    subtitle: "A valid phone number is required to issue a formal estimate.",
    type: "input-number",
    validation: Yup.string()
      .matches(
        /^(\+1\s?)?(\(\d{3}\)\s?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/,
        "Phone number is Invalid"
      )
      .required("Phone number is required "),
  },
];

interface SubmitFormProps {
  projectTitle: string;
  zipCode: string;
  companyName: string;
  targetEmail: string;
  zipLocation: Locations | null;
  projectId?: string | string[];
  service: string;
  questions: any;
  serviceData: any;
  product: string;
}
interface Locations {
  city: string;
  state: string;
}

// ThankYou Modal Component
interface ThankYouModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  companyName: string;
  heroImage: string;
  contactPhone: string;
  service: string;
  customerLogo: string;
}

const ThankYouModal = ({
  isOpen,
  setIsOpen,
  companyName,
  heroImage,
  contactPhone,
  customerLogo,
}: ThankYouModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-full w-full h-[100dvh] p-0 rounded-lg text-[#0b1b3f] overflow-y-auto ">
        <div className="min-h-full bg-white">
          <section className="relative min-h-full">
            <div className="relative w-full h-screen">
              <Image
                src={heroImage}
                alt="Background Image"
                layout="fill"
                objectFit="cover"
                quality={75}
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANg=="
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b1b3fc6] to-[#0b1b3fbe] z-10" />
            </div>

            <div className="absolute inset-0 z-20 px-4 flex flex-col min-h-full">
              {/* Space for logos at top */}
              <div className="pt-4 pb-2 max-w-[1320px] mx-auto w-full">
                <div className="flex items-center justify-between">
                  <Image
                    src="/images/logo_in.svg"
                    alt="Logo"
                    width={140}
                    height={140}
                  />

                  <Image
                    src={customerLogo}
                    alt="Customer Logo"
                    width={150}
                    height={150}
                  />
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center py-4">
                <div className="max-w-2xl mx-auto text-center">
                  {/* Thank You Message */}
                  <h1 className="text-4xl font-bold mb-6 text-white">
                    Thank You!
                  </h1>

                  {/* Checkmark Icon */}
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-[#28a745] rounded-full mx-auto flex items-center justify-center">
                      <svg
                        className="w-14 h-14 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <p className="text-xl mb-10 text-white">
                    Your estimator from <strong>{companyName}</strong> will call
                    you within the next 5-10 minutes.
                  </p>

                  {/* What to Expect Section */}
                  <div className="mb-6">
                    <h2 className="text-xl text-left md:text-center font-bold mb-4 text-white">
                      What to Expect:
                    </h2>
                    <div className="space-y-4 text-left max-w-md mx-auto">
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6 text-white"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-xl text-white">
                          Quick 10-minute call
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6 text-white"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.54 15h6.42l.5 1.5H8.29l.5-1.5zm8.085-8.995a.75.75 0 10-.75-1.299 12.81 12.81 0 00-3.558 3.05L11.03 8.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 001.146-.102 11.312 11.312 0 013.612-3.321z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-xl text-white">
                          Confirm project goals
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6 text-white"
                          >
                            <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                            <path
                              fillRule="evenodd"
                              d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-xl text-white">
                          Schedule your free in-home estimate
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Box */}
                  <div className="bg-[#fffff0] rounded-lg p-4 mb-4 max-w-md mx-auto">
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-8 h-8 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-2xl ml-3 font-bold">4.8</span>
                    </div>
                    <p className="text-xl font-bold">1,500+ Happy Homeowners</p>
                  </div>

                  {/* Contact Information */}
                  {contactPhone && (
                    <p className="text-lg mb-8 text-white">{contactPhone}</p>
                  )}

                  {/* Return Button */}
                  <p
                    onClick={() => window.location.reload()}
                    className="bg-[#28a745] text-white  mt-4 px-8 py-3 rounded-lg text-xl font-semibold hover:bg-[#2a4c71] transition-colors inline-block cursor-pointer mb-4"
                  >
                    Return to Home
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
}: SubmitFormProps) => {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const { toast } = useToast();
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [submitInFlight, setSubmitInFlight] = useState(false);
  const [phoneValidation, setPhoneValidation] = useState<{
    status: "idle" | "verifying" | "pass" | "fail";
    score?: number;
    lineType?: string;
  }>({ status: "idle" });

  const allSteps = [...questions, ...COMMON_STEPS];

  const getCurrentValidationSchema = (step: Step) => {
    if (step.type === "composite") {
      return Yup.object(
        step.fields?.reduce(
          (acc, field) => ({
            ...acc,
            [field.name]: field.validation,
          }),
          {}
        )
      );
    }

    if (
      step.validation &&
      typeof step.validation === "object" &&
      step.validation.type === "required"
    ) {
      return Yup.object({
        [step.name]: Yup.string().required(
          step.validation.message || "This field is required"
        ),
      });
    }

    return Yup.object({
      [step.name]: step.validation,
    });
  };

  const initialValues = allSteps.reduce((acc, step) => {
    if (step.type === "composite") {
      step.fields?.forEach((field: any) => {
        acc[field.name] = "";
      });
    } else {
      acc[step.name] = "";
    }
    return acc;
  }, {} as Record<string, string>);
  initialValues.xxTrustedFormCertUrl = "";
  initialValues.phone_validation_status = "";
  initialValues.phone_activity_score = "";
  initialValues.phone_line_type = "";
  // Honeypot fields (bots may fill these)
  initialValues.honeypot = "";
  initialValues.honeypot_field_name = "website";

  const validatePhoneInline = async (
    inputValue: string,
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  ) => {
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
        setFieldValue("phone_validation_status", "fail");
        return;
      }

      const data = await res.json();
      const is_valid = data?.is_valid;
      const activity_score = data?.activity_score;
      const line_type = data?.line_type;
      const validation_status = is_valid ? "pass" : "fail";

      setPhoneValidation({
        status: validation_status as "pass" | "fail",
        score: typeof activity_score === "number" ? activity_score : undefined,
        lineType: typeof line_type === "string" ? line_type : undefined,
      });

      setFieldValue("phone_validation_status", validation_status);
      if (activity_score != null)
        setFieldValue("phone_activity_score", String(activity_score));
      if (line_type != null) setFieldValue("phone_line_type", line_type);
    } catch (_err) {
      setPhoneValidation({ status: "fail" });
      setFieldValue("phone_validation_status", "fail");
    }
  };

  const handleNext = (values: any) => {
    // Sync TrustedForm value from DOM before next step or submit
    const tfInput = document.getElementById(
      "xxTrustedFormCertUrl"
    ) as HTMLInputElement | null;
    const tfValue = tfInput?.value;
    if (tfValue && values.xxTrustedFormCertUrl !== tfValue) {
      values.xxTrustedFormCertUrl = tfValue;
    }
    // Sync honeypot from DOM (off-screen input named "website")
    const hpInput = document.getElementById(
      "hp_website"
    ) as HTMLInputElement | null;
    const hpValue = hpInput?.value || "";
    if (values.honeypot !== hpValue) {
      values.honeypot = hpValue;
    }
    values.honeypot_field_name = "website";
    if (stepIndex === allSteps.length - 1) {
      handleSubmit(values);
    } else {
      setStepIndex((prev) => prev + 1);
      setProgress(((stepIndex + 1) / (allSteps.length - 1)) * 100);
    }
  };

  const sendEmail = async (
    recipientEmails: string,
    subject: string,
    message: string
  ) => {
    // Split the recipientEmails string by commas and trim each email address------------
    const emailList = recipientEmails.split(",").map((email) => email.trim());

    try {
      // Loop through each email address and send an email
      for (const email of emailList) {
        const res = await fetch("/api/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderEmail: "leads@neuhomeservices.com",
            senderName: "Neumediagroup",
            subject: subject,
            message: message,
            recipientEmail: email,
          }),
        });

        if (res.ok) {
          console.log(`Email sent successfully to ${email}!`);
        } else {
          console.error(`Failed to send email to ${email}.`);
        }
      }
    } catch (err) {
      console.error("Error sending emails:", err);
    }
  };
  const [info, setInfo] = useState({ os: "", browser: "" });
  const [serverIp, setServerIp] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const detectAndFetch = async () => {
      try {
        const userAgent = navigator.userAgent;

        // Simple detection
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
        console.log("IP details", data);
        if (isMounted) setServerIp(data?.ip ?? "");
      } catch (_error) {
        // Ignore fetch abort and failures silently for UI stability
      }
    };

    detectAndFetch();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleSubmit = async (values: any) => {
    if (submitInFlight) return; // guard duplicate clicks / retries
    setSubmitInFlight(true);
    // Sync TrustedForm value from DOM before submit
    const tfInput = document.getElementById(
      "xxTrustedFormCertUrl"
    ) as HTMLInputElement | null;
    const tfValue = tfInput?.value;
    if (tfValue && values.xxTrustedFormCertUrl !== tfValue) {
      values.xxTrustedFormCertUrl = tfValue;
    }
    // Sync honeypot from DOM (off-screen input named "website")
    const hpInput = document.getElementById(
      "hp_website"
    ) as HTMLInputElement | null;
    const hpValue = hpInput?.value || "";
    if (values.honeypot !== hpValue) {
      values.honeypot = hpValue;
    }
    values.honeypot_field_name = "website";
    // Split fullName into firstName and lastName for Supabase
    let firstName = "";
    let lastName = "";
    if (values.fullName) {
      const nameParts = values.fullName.trim().split(/\s+/);
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    }
    try {
      const { data, error } = await supabase
        .from(serviceData.serviceRequest)
        .insert([
          {
            ...values,
            firstName,
            lastName,
            city: zipLocation?.city,
            state: zipLocation?.state,
            Zip_code: zipCode,
            // Service: projectTitle,
            ip_address: serverIp,
            os: info.os,
            browser: info.browser,
            utm_source: window.location.href,
            landing_page: projectTitle,
            xxTrustedFormCertUrl: values.xxTrustedFormCertUrl,
            phone_validation_status: phoneValidation.status,
            phone_activity_score: phoneValidation.score,
            phone_line_type: phoneValidation.lineType,
          },
        ])
        .select();

      console.log("Response data:", data);
      console.log("Error:", error);

      if (error) {
        toast({
          title: "Submission Error",
          description:
            "There was an error submitting your form. Please try again.",
        });
      } else {
        toast({
          title: "Form Submitted",
          description: "Your form has been successfully submitted.",
          duration: 1000,
        });

        const emailSubject = "New Service Request Submitted";
        let emailMessage =
          "A new service request has been submitted with the following details:\n\n";

        const commonFields = ["fullName", "Email", "phoneNumber"];
        const otherFields = Object.keys(values).filter(
          (key) =>
            !commonFields.includes(key) &&
            key !== "xxTrustedFormCertUrl" &&
            key !== "honeypot" &&
            key !== "honeypot_field_name"
        );

        for (const key of commonFields) {
          if (values[key]) {
            const formattedKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            emailMessage += `${formattedKey}: ${values[key]}\n`;
          }
        }

        // Add zip code to email message
        emailMessage += `Zip Code: ${zipCode}\n`;

        for (const key of otherFields) {
          const formattedKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
          emailMessage += `${formattedKey}: ${values[key]}\n`;
        }
        emailMessage += `Product: ${product}\n`;
        // Add TrustedForm cert URL to email
        // if (values.xxTrustedFormCertUrl) {
        //   emailMessage += `TrustedForm Cert URL: ${values.xxTrustedFormCertUrl}\n`;
        // }
        await sendEmail(targetEmail, emailSubject, emailMessage);

        // Show thank you modal instead of redirecting
        setShowThankYouModal(true);

        // PostHog: fire form_submit success with experiment/variant
        try {
          const pathname =
            typeof window !== "undefined" ? window.location.pathname : "/";
          const slug = pathname.split("/").filter(Boolean)[0] || "";
          const expKey = slug ? `exp__${slug}__v1` : null;
          const match = (
            typeof document !== "undefined" ? document.cookie : ""
          ).match(new RegExp("(^| )ab_" + slug + "=([^;]+)"));
          const variant = match ? decodeURIComponent(match[2]) : undefined;
          (posthog as any).capture(
            "form_submit",
            {
              form_id: serviceData?.form_id || "lead-form",
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
        } catch {}
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again later.",
      });
    }
    setSubmitInFlight(false);
  };
  const renderStep = (step: Step, setFieldValue: any, values: any) => {
    switch (step.type) {
      case "radio":
        return (
          <>
            <RadioGroup
              className="flex flex-col items-center space-y-1 mt-4"
              value={values[step.name]}
              onValueChange={(value) => setFieldValue(step.name, value)}
            >
              {step.options?.map((option) => (
                <div
                  key={option}
                  className={`flex items-center justify-between w-full max-w-sm border rounded-lg p-4 cursor-pointer ${
                    values[step.name] === option
                      ? "border-[#28a745] bg-green-50"
                      : "border-gray-300"
                  }`}
                  onClick={() => setFieldValue(step.name, option)}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-6 w-6 rounded-full border-2 flex justify-center items-center ${
                        values[step.name] === option
                          ? "border-[#28a745] bg-[#28a745]"
                          : "border-gray-300"
                      }`}
                    >
                      {values[step.name] === option && (
                        <div className="h-3 w-3 bg-white rounded-full" />
                      )}
                    </div>
                    <label className="text-base font-medium">{option}</label>
                  </div>
                </div>
              ))}
            </RadioGroup>

            {/* Warning Message with Buttons------- */}
            {step.warningMessage &&
              (Array.isArray(step.warningMessage.condition)
                ? step.warningMessage.condition.includes(values[step.name])
                : values[step.name] === step.warningMessage.condition) && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-orange-600 mb-4">
                    {step.warningMessage.message.replace(
                      "{selection}",
                      values[step.name]
                    )}
                  </div>
                  {step.warningMessage.buttons && (
                    <div className="flex justify-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-24"
                        onClick={() => {
                          setFieldValue(step.name, "");
                        }}
                      >
                        No
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        className="w-24"
                        onClick={handleNext}
                      >
                        Yes
                      </Button>
                    </div>
                  )}
                </div>
              )}
          </>
        );

      case "composite":
        return (
          <div className="w-full lg:w-1/3 mx-auto">
            {step.fields?.map((field) => (
              <div key={field.name}>
                <Field
                  name={field.name}
                  as={Input}
                  placeholder={field.placeholder}
                  className="mb-4 p-6 rounded-md placeholder:font-semibold"
                  {...(field.name === "fullName" || field.name === "Email"
                    ? { "data-ph-no-capture": true }
                    : {})}
                />
                <ErrorMessage
                  name={field.name}
                  component="div"
                  className="text-red-500 text-sm mb-2"
                />
              </div>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="flex flex-col items-center space-y-4 max-h-96 overflow-y-auto">
            {step.options?.map((option) => {
              const isChecked = values[step.name]?.includes(option);

              return (
                <div
                  key={option}
                  className={`flex items-center justify-between w-full max-w-[300px]   rounded-xl p-3 border-2 cursor-pointer transition-colors hover:border-green-300 ${
                    isChecked
                      ? "border-[#28a745] bg-green-50"
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    const newValues = isChecked
                      ? values[step.name]?.filter(
                          (val: string) => val !== option
                        )
                      : [...(values[step.name] || []), option];

                    setFieldValue(step.name, newValues);
                  }}
                >
                  <input
                    type="checkbox"
                    name={step.name}
                    value={option}
                    checked={isChecked}
                    onChange={() => {}}
                    className="hidden"
                  />
                  <label>{option}</label>
                </div>
              );
            })}
          </div>
        );
      case "input-number":
        return (
          <div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-2 w-full lg:w-1/2 mx-auto">
                <div className="relative w-full">
                  <Field name={step.name}>
                    {({ field, form }: any) => (
                      <Input
                        {...field}
                        type="tel"
                        maxLength={10}
                        placeholder="Enter Your Phone Number"
                        pattern="\(\d{3}\)\d{3}-\d{4}"
                        className="p-6 pl-12 w-full rounded-md placeholder:font-semibold"
                        data-ph-no-capture
                        onInput={(e: any) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 10) {
                            const formattedValue = value.replace(
                              /(\d{3})(\d{3})(\d{4})/,
                              "($1)$2-$3"
                            );
                            e.target.value = formattedValue;
                          }
                          field.onChange(e);
                        }}
                        onChange={(e: any) => {
                          field.onChange(e);
                          validatePhoneInline(
                            e.target.value,
                            form.setFieldValue
                          );
                        }}
                      />
                    )}
                  </Field>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <LockKeyhole
                      size={20}
                      strokeWidth={3}
                      className="text-[#fa8c16]"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="default"
                  disabled={phoneValidation.status === "verifying"}
                  className="w-full md:max-w-48 bg-[#28a745] p-6 text-white hover:bg-[#28a745] disabled:bg-green-300"
                >
                  Submit my request
                </Button>
                {/* Inline phone validation feedback */}
              </div>
              <div>
                {phoneValidation.status === "verifying" && (
                  <div className="text-xs text-gray-500">Verifying...</div>
                )}
                {phoneValidation.status === "pass" && (
                  <div className="text-xs text-green-600">
                    Verified number confirmed. We'll text or call you to
                    schedule your appointment time.{" "}
                  </div>
                )}
                {phoneValidation.status === "fail" && (
                  <div className="text-xs text-amber-600">
                    We couldn’t verify this number, but you can still submit
                    your request.
                  </div>
                )}
              </div>
            </div>

            <p className="my-6 text-center text-[10px] text-gray-500 font-semibold">
              {serviceData.neuMediaText ||
                " Neu Media Group, the operator of this website, and/or our local partner will contact you via a call, text, or email using manual or automated technology at the telephone number provided, including your wireless number, to arrange a convenient time to do an in-home estimate for you. You understand that your consent is not required to purchase products or services, and you understand that you may revoke your consent at any time."}
            </p>
          </div>
        );
      case "input":
        return (
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-2 w-full lg:w-1/2 mx-auto mt-4">
            <div className="relative w-full">
              <Field
                name={step.name}
                type="tel"
                as={Input}
                placeholder="Kitchen size"
                className="p-6 pl-12 w-full rounded-md placeholder:font-semibold"
              />
            </div>
          </div>
        );
      case "dropdown":
        return (
          <div className="w-full lg:w-1/3 mx-auto mt-4">
            <Select
              value={values[step.name]}
              onValueChange={(value) => setFieldValue(step.name, value)}
              defaultValue={step.options?.[0]}
            >
              <SelectTrigger className="w-full p-6 rounded-md">
                <SelectValue
                  placeholder={step.placeholder || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent>
                {step.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "string":
        return (
          <div className="w-full lg:w-1/3 mx-auto mt-4">
            <Field
              name={step.name}
              as={Input}
              type="text"
              placeholder={step.placeholder || "Enter text"}
              className="mb-4 p-6 rounded-md placeholder:font-semibold"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const currentStep = allSteps[stepIndex];
  const isLastStep = stepIndex === allSteps.length - 1;

  return (
    <>
      <div className="flex justify-center items-center w-full">
        <Formik
          initialValues={initialValues}
          validationSchema={getCurrentValidationSchema(currentStep)}
          onSubmit={handleNext}
        >
          {({ values, isValid, setFieldValue }: FormikProps<any>) => (
            <FormikForm className="w-full p-6 bg-white rounded-2xl relative overflow-hidden">
              {/* TrustedForm hidden input */}
              <input
                type="hidden"
                name="xxTrustedFormCertUrl"
                id="xxTrustedFormCertUrl"
              />
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

              <div
                className="absolute bottom-0 left-0 h-[5px] bg-[#28a745] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />

              <h2 className="text-2xl font-semibold text-center">
                {currentStep.title}
              </h2>
              {currentStep.subtitle && (
                <p className="mb-6 text-center text-sm text-gray-500 font-semibold">
                  {currentStep.subtitle}
                </p>
              )}

              <div className="text-center font-semibold">
                {renderStep(currentStep, setFieldValue, values)}
                {currentStep.name !== "fullName" && (
                  <ErrorMessage
                    name={currentStep.name}
                    component="div"
                    className="text-red-500 text-sm mb-2"
                  />
                )}
                {!isLastStep && (
                  <Button
                    type="submit"
                    className="mt-4 p-6 bg-green-400 text-white hover:bg-[#28a745] disabled:bg-green-300"
                    disabled={!isValid}
                  >
                    Next
                  </Button>
                )}
              </div>
            </FormikForm>
          )}
        </Formik>
      </div>

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={showThankYouModal}
        setIsOpen={setShowThankYouModal}
        companyName={companyName}
        heroImage={serviceData.heroImage.url}
        contactPhone={serviceData.contactPhone}
        service={service}
        customerLogo={serviceData.customerLogo?.url || ""}
      />
    </>
  );
};

export default SubmitForm;
