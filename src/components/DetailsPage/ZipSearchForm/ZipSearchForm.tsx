"use client";
import { useState, useEffect, useRef } from "react";
import supabase from "@/utils/supabase/client";
import {
  CircleCheckBig,
  MapPin,
  ShieldCheck,
  Clock3,
  Loader2,
  ArrowRight,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import SubmitForm from "@/components/SubmitForm/SubmitForm";
import posthog from "posthog-js";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ZipSearchFormProps {
  onStatusChange: (status: string | null) => void;
  onZipLocations: (
    ZipLocations: { city: string; state: string } | null
  ) => void;
  projectId?: string | string[];
  service: string;
  deliveryEmail?: string;
  serviceData: any;
  hero?: boolean;
  /** Flip to true to open the modal with a ZIP-first screen (floating button flow) */
  triggerModal?: boolean;
  onTriggerModalReset?: () => void;
  /** Called when the user confirms exit and the modal session is fully reset */
  onModalSessionEnd?: () => void;
}

interface Locations {
  city: string;
  state: string;
}

type ModalView = "zip" | "form";
type PersistedFormValues = Record<string, string | string[]>;

const ZipSearchForm = ({
  onStatusChange,
  onZipLocations,
  projectId,
  service,
  serviceData,
  hero,
  triggerModal,
  onTriggerModalReset,
  onModalSessionEnd,
}: ZipSearchFormProps) => {
  // ── Hero ZIP state ──────────────────────────────────────────────
  const [zipCode, setZipCode] = useState("");
  const [isMatched, setIsMatched] = useState(false);

  // ── Modal ZIP state ─────────────────────────────────────────────
  const [modalZipInput, setModalZipInput] = useState("");
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [modalZipError, setModalZipError] = useState("");
  const [modalZipMatched, setModalZipMatched] = useState(false);

  // ── Modal / wizard state ────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [modalView, setModalView] = useState<ModalView>("zip");
  const [projectTitle, setProjectTitle] = useState<string>(serviceData.title);
  const [deliveryEmail, setDeliveryEmail] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [product, setProduct] = useState<string>("");
  const [zipLocations, setZipLocations] = useState<Locations | null>(null);
  const [formProgress, setFormProgress] = useState(0);
  const [formStep, setFormStep] = useState(1);
  const [formTotalSteps, setFormTotalSteps] = useState(0);
  const [persistedFormValues, setPersistedFormValues] = useState<PersistedFormValues>({});
  const [persistedFormStepIndex, setPersistedFormStepIndex] = useState(0);

  // sessionKey: increment to remount SubmitForm fresh on every new modal session
  const [sessionKey, setSessionKey] = useState(0);

  const intentFiredRef = useRef(false);

  const resetFormSession = () => {
    setPersistedFormValues({});
    setPersistedFormStepIndex(0);
    setFormProgress(0);
    setFormStep(1);
    setFormTotalSteps(0);
  };

  const handleAttemptExit = () => {
    setIsExitConfirmOpen(true);
  };

  const handleConfirmExit = () => {
    setIsExitConfirmOpen(false);
    setIsModalOpen(false);
    setSessionKey((prev) => prev + 1);
    intentFiredRef.current = false;
    resetFormSession();
    setModalView("zip");
    setModalZipInput("");
    setModalZipError("");
    setModalZipMatched(false);
    setZipLocations(null);
    setDeliveryEmail("");
    setCompanyName("");
    setProduct("");
    setZipCode("");
    setIsMatched(false);
    onStatusChange(null);
    onZipLocations(null);
    onModalSessionEnd?.();
  };

  useEffect(() => {
    setProjectTitle(serviceData.title);
  }, [projectId]);

  // ── Hero ZIP validation ─────────────────────────────────────────
  const validateHeroZip = async () => {
    if (!zipCode || zipCode.length !== 5) {
      onStatusChange(null);
      onZipLocations(null);
      setIsMatched(false);
      return;
    }
    try {
      const { data } = await supabase
        .from(serviceData.zipCodes)
        .select(
          `Zip_Code, City, State, Service, "Company name", "Lead Delivery Email"`
        )
        .eq("Zip_Code", zipCode)
        .eq("Service_Slug", service);

      if (data?.length) {
        const {
          ["Company name"]: cn,
          City: city,
          State: state,
          ["Lead Delivery Email"]: leadEmail,
        } = data[0];
        onZipLocations({ city, state });
        setZipLocations({ city, state });
        setDeliveryEmail(leadEmail);
        setCompanyName(cn);
        onStatusChange("matched");
        setIsMatched(true);
        setProduct(data[0].Service);
      } else {
        setIsMatched(false);
        onStatusChange("not_matched");
        onZipLocations(null);
        posthog.capture("zip_not_serviced", { zip_code: zipCode, service, location: "hero" });
      }
    } catch {
      onStatusChange("Error checking ZIP code");
      onZipLocations(null);
      setIsMatched(false);
    }
  };

  useEffect(() => {
    validateHeroZip();
  }, [zipCode]);

  // ── Modal ZIP validation (no auto-advance; user clicks Next) ────
  const validateModalZip = async (zip: string) => {
    if (zip.length !== 5) {
      setModalZipError("");
      setModalZipMatched(false);
      return;
    }
    setModalIsLoading(true);
    setModalZipError("");
    try {
      const { data } = await supabase
        .from(serviceData.zipCodes)
        .select(
          `Zip_Code, City, State, Service, "Company name", "Lead Delivery Email"`
        )
        .eq("Zip_Code", zip)
        .eq("Service_Slug", service);

      if (data?.length) {
        const {
          ["Company name"]: cn,
          City: city,
          State: state,
          ["Lead Delivery Email"]: leadEmail,
        } = data[0];
        setZipLocations({ city, state });
        setDeliveryEmail(leadEmail);
        setCompanyName(cn);
        setProduct(data[0].Service);
        setZipCode(zip);
        setModalZipMatched(true);
        // User clicks "Check Availability →" to advance — no auto-advance
      } else {
        setModalZipError("ZIP code is currently not serviced by our contractor.");
        setModalZipMatched(false);
        posthog.capture("zip_not_serviced", { zip_code: zip, service, location: "modal" });
      }
    } catch {
      setModalZipError("Could not check ZIP code. Please try again.");
      setModalZipMatched(false);
    } finally {
      setModalIsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && modalView === "zip") {
      validateModalZip(modalZipInput);
    }
  }, [modalZipInput]);

  // ── Fire posthog form_intent once per session ───────────────────
  const fireFormIntent = (cn = companyName, zip = zipCode) => {
    if (intentFiredRef.current) return;
    intentFiredRef.current = true;
    try {
      const pathname =
        typeof window !== "undefined" ? window.location.pathname : "/";
      const slug = pathname.split("/").filter(Boolean)[0] || "";
      const expKey = slug ? `exp_${slug}_v1` : null;
      const match = (
        typeof document !== "undefined" ? document.cookie : ""
      ).match(new RegExp("(^| )ab_" + slug + "=([^;]+)"));
      const variant = match ? decodeURIComponent(match[2]) : undefined;
      (posthog as any).capture(
        "form_intent",
        {
          form_id: serviceData?.form_id || "lead-form",
          client_id: cn,
          path: pathname,
          experiment_key: expKey || undefined,
          variant,
          service,
          zip_code: zip,
        },
        { send_feature_flags: true } as any
      );
    } catch { }
  };

  // ── Advance from ZIP screen to form ────────────────────────────
  const handleZipNext = () => {
    if (!modalZipMatched) return;
    fireFormIntent(companyName, zipCode);
    if (persistedFormStepIndex === 0) {
      setFormProgress(0);
      setFormStep(1);
      setFormTotalSteps(0);
    }
    setModalView("form");
  };

  // ── Go back to the ZIP screen, pre-filling current validated zip ─
  const goBackToZip = () => {
    setModalView("zip");
    setModalZipInput(zipCode);
    setModalZipMatched(true);
    setModalZipError("");
  };

  // ── Hero ZIP match → open modal directly at form view ──────────
  useEffect(() => {
    if (!isMatched || isModalOpen) return;
    fireFormIntent();
    setSessionKey((prev) => prev + 1);
    resetFormSession();
    setModalView("form");
    setIsModalOpen(true);
  }, [isMatched]);

  // ── Floating button → open modal at ZIP view ───────────────────
  useEffect(() => {
    if (!triggerModal) return;
    setSessionKey((prev) => prev + 1);
    resetFormSession();
    setModalView("zip");
    setModalZipInput("");
    setModalZipError("");
    setModalZipMatched(false);
    setIsModalOpen(true);
    onTriggerModalReset?.();
  }, [triggerModal]);

  return (
    <div className="text-center">
      {hero && (
        <h2 className="text-[16px] md:text-2xl  mb-4 md:mb-6 text-white leading-tight tracking-[-0.5px] font-semibold">
          {serviceData.heroSubHeading
            ? serviceData.heroSubHeading
            : "Let's find out! Enter your ZIP code below"}
        </h2>
      )}

      {/* Hero ZIP input */}
      <div className="flex justify-center items-center gap-8 relative px-2">
        <div className="relative border border-gray-300 flex items-center gap-2 bg-white px-2 rounded-md w-full md:w-auto">
          <MapPin className="text-gray-800 w-6 h-6" />
          <input
            type="text"
            placeholder="Enter ZIP code"
            aria-label="ZIP code"
            maxLength={5}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            autoComplete="postal-code"
            inputMode="numeric"
            className="md:text-base text-sm px-0 pr-8 py-[14px] outline-none transition placeholder:text-gray-600"
          />
        </div>
        {isMatched && (
          <CircleCheckBig
            className="absolute text-[#28a745] w-5 h-5 top-1/2 transform -translate-y-1/2"
            aria-label="Matched"
          />
        )}
      </div>

      {/* ── Full-screen wizard modal ── */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleAttemptExit();
            return;
          }

          setIsModalOpen(true);
        }}
      >
        <DialogContent
          className="flex flex-col overflow-hidden rounded-none border-0 p-0 shadow-none gap-0"
          style={{
            position: "fixed",
            inset: 0,
            transform: "none",
            width: "100vw",
            height: "100dvh",
            maxWidth: "none",
            maxHeight: "none",
            margin: 0,
            borderRadius: 0,
            left: 0,
            top: 0,
          }}
        >
          <DialogTitle className="sr-only">Get Your Free Estimate</DialogTitle>
          <DialogDescription className="sr-only">
            Complete the estimate form or confirm that you want to leave and lose your progress.
          </DialogDescription>

          {/* ── Sticky header ── */}
          <div className="flex-shrink-0  z-10 bg-[#0b1b3f]">
            <div className="flex items-center justify-center py-2 bg-[#0b1b3f]">
              {serviceData.customerLogo?.url ? (
                <button
                  type="button"
                  onClick={handleAttemptExit}
                  className="cursor-pointer"
                  aria-label="Exit form"
                >
                  <Image
                    src={serviceData.customerLogo?.url}
                    alt={`${companyName || serviceData.title} logo`}
                    width={142}
                    height={142}
                    priority
                    sizes="142px"
                    className="w-[142px] h-[65px] object-contain"

                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAttemptExit}
                  className="cursor-pointer"
                  aria-label="Exit form"
                >
                  <Image
                    src='/images/logo_in.svg'
                    alt="NEU Home Services logo"
                    width={142}
                    height={142}
                    priority
                    sizes="142px"
                    className="w-[142px] h-[65px] object-contain"

                  />
                </button>
              )
              }
            </div>


            <div className="flex items-center justify-center px-4 sm:px-6 pb-6 text-white ">
              {/* Trust signals — LEFT, larger */}
              <div className="flex items-center gap-2 sm:gap-6">
                <span className="flex items-center gap-1.5 text-xs md:text-base  font-medium">
                  <ShieldCheck className="md:w-7 md:h-7 w-5 h-5 text-[#28a745] shrink-0" />
                  Secure .
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white font-medium">
                  No spam .
                </span>
                <div className="flex items-start justify-start md:gap-1">
                  <span className="md:text-base text-xs ml-1">4.9 {"  "}</span>

                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="md:w-5 md:h-5 w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}

                </div>
              </div>

            </div>
            {/* Progress bar — always visible; starts at 8% on ZIP screen */}

            <div className="h-1 md:h-1.5  w-full bg-gray-50">
              <div
                className="h-full bg-[#28a745] transition-all duration-500 ease-out rounded-r-full"
                style={{
                  width: modalView === "zip"
                    ? "8%"
                    : `${Math.max(8, formProgress)}%`,
                }}
              />
            </div>

          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto bg-white">

            {/* ZIP-entry screen */}
            {modalView === "zip" && (
              <div className="flex flex-col items-center justify-start  px-6 md:py-16 py-10 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Check availability in your area
                </h2>
                <p className="text-gray-500 text-sm mb-8 max-w-xs">
                  {serviceData.heroSubHeading
                    ? serviceData.heroSubHeading
                    : "Let's find out! Enter your ZIP code below"}
                </p>

                <div className="w-full max-w-xs space-y-3">
                  {/* ZIP input */}
                  <div
                    className={`flex items-center gap-2 border rounded-sm px-3 bg-white transition-colors ${modalZipError
                      ? "border-red-400"
                      : modalZipMatched
                        ? "border-[#28a745]"
                        : "border-gray-500 focus-within:border-[#28a745]"
                      }`}
                  >
                    <MapPin
                      className={`w-5 h-5 shrink-0 ${modalZipMatched ? "text-[#28a745]" : "text-gray-400"
                        }`}
                    />
                    <input
                      type="text"
                      placeholder="Enter ZIP code"
                      aria-label="ZIP code"
                      maxLength={5}
                      value={modalZipInput}
                      autoFocus
                      inputMode="numeric"
                      autoComplete="postal-code"
                      onChange={(e) =>
                        setModalZipInput(e.target.value.replace(/\D/g, ""))
                      }
                      className="flex-1 py-4 text-base outline-none bg-transparent"
                    />
                    {modalIsLoading && (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
                    )}
                    {modalZipMatched && !modalIsLoading && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" style={{ fill: "none" }}><circle cx="12" cy="12" r="11" fill="#03AB5F" fillOpacity=".2"></circle><path fillRule="evenodd" clipRule="evenodd" d="M17.207 8.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 5.293-5.293a1 1 0 011.414 0z" fill="#06C778"></path></svg>)}
                  </div>

                  {modalZipError && (
                    <p className="text-sm text-red-500 font-medium">
                      {modalZipError}
                    </p>
                  )}
                  {modalZipMatched && !modalIsLoading && (
                    <p className="text-left text-[#28a745] font-semibold">{`${zipLocations?.city}, ${zipLocations?.state}`}</p>
                  )}

                  {!modalZipError && modalZipInput.length > 0 && modalZipInput.length < 5 && (
                    <p className="text-xs text-gray-400">Enter all 5 digits</p>
                  )}

                  {/* Next / Check Availability button */}
                  <button
                    onClick={handleZipNext}
                    disabled={!modalZipMatched || modalIsLoading}
                    className={`w-full flex items-center justify-center  !mt-8 gap-2 py-4 rounded-sm text-sm font-bold transition-all duration-200 ${modalZipMatched && !modalIsLoading
                      ? "bg-[#28a745] text-white hover:bg-[#22963c] shadow-md hover:shadow-lg"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {modalIsLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking…
                      </>
                    ) : modalZipMatched ? (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      "Check Availability"
                    )}
                  </button>
                </div>

                <p className="mt-8 text-sm text-gray-400 max-w-xs">
                  No spam. No obligation. We only connect you with verified
                  local contractors.
                </p>
              </div>
            )}

            {/* Wizard form screen — always mounted so form values persist */}
            <div style={{ display: modalView === "form" ? undefined : "none" }}>
              <SubmitForm
                key={sessionKey}
                service={service}
                projectTitle={projectTitle}
                zipCode={zipCode}
                zipLocation={zipLocations}
                targetEmail={deliveryEmail}
                projectId={projectId}
                product={product}
                companyName={companyName}
                questions={serviceData.questions}
                serviceData={serviceData}
                onProgressChange={setFormProgress}
                onStepChange={(step, total) => {
                  setFormStep(step);
                  setFormTotalSteps(total);
                }}
                persistedValues={persistedFormValues}
                persistedStepIndex={persistedFormStepIndex}
                onPersistValuesChange={setPersistedFormValues}
                onPersistStepIndexChange={setPersistedFormStepIndex}
                onBackToZip={goBackToZip}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isExitConfirmOpen} onOpenChange={setIsExitConfirmOpen} >
        <DialogContent className="fixed z-[92] w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-7 [&>button]:hidden">
          <button
            type="button"
            onClick={() => setIsExitConfirmOpen(false)}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            aria-label="Close confirmation dialog"
          >
            <X className="h-6 w-6" />
          </button>
          <DialogTitle className="pr-8 text-left text-2xl font-bold text-[#0b1b3f]">
            Are you sure?
          </DialogTitle>
          <DialogDescription className="mt-2 text-left text-base text-gray-600">
            If you exit this page, you&apos;ll lose your progress.
          </DialogDescription>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExitConfirmOpen(false)}
              className="h-11 flex-1 rounded-md border-gray-300 p-3 bg-white text-sm font-semibold text-[#0b1b3f] hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmExit}
              className="h-11 flex-1 rounded-md bg-[#28a745] text-sm font-semibold text-white hover:bg-[#28a746dc] p-3"
            >
              Leave page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ZipSearchForm;
