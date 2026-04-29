"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CONTACT_OPEN_ESTIMATE_EVENT } from "@/lib/contact-estimate-events";
import type { ServiceData } from "@/types/service";
import posthog from "posthog-js";

const ZipSearchForm = dynamic(
  () => import("@/components/DetailsPage/ZipSearchForm/ZipSearchForm"),
  { ssr: true, loading: () => null }
);

export type ServiceOption = { slug: string; title: string };

export default function ContactEstimateLauncher({
  services,
}: {
  services: ServiceOption[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [triggerZipModal, setTriggerZipModal] = useState(false);

  const resetPicker = useCallback(() => {
    setSelectedSlug("");
    setFetchError(null);
  }, []);

  const openFlow = useCallback(() => {
    setServiceData(null);
    setTriggerZipModal(false);
    resetPicker();
    setPickerOpen(true);
    posthog.capture("estimate_picker_opened", { location: "contact_flow" });
  }, [resetPicker]);

  useEffect(() => {
    const handleEvent = () => openFlow();
    window.addEventListener(CONTACT_OPEN_ESTIMATE_EVENT, handleEvent);
    return () => window.removeEventListener(CONTACT_OPEN_ESTIMATE_EVENT, handleEvent);
  }, [openFlow]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#get-estimate") {
      openFlow();
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [openFlow]);

  const handleContinue = async () => {
    if (!selectedSlug) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(
        `/api/service/by-slug?slug=${encodeURIComponent(selectedSlug)}`
      );
      if (!res.ok) {
        throw new Error("not_found");
      }
      const data = (await res.json()) as ServiceData;
      const selectedTitle = sorted.find((s) => s.slug === selectedSlug)?.title;
      posthog.capture("estimate_picker_service_selected", {
        service_slug: selectedSlug,
        service_title: selectedTitle,
        location: "contact_flow",
      });
      setServiceData(data);
      setPickerOpen(false);
      setTriggerZipModal(true);
    } catch {
      setFetchError("Unable to load that service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSessionEnd = useCallback(() => {
    setServiceData(null);
    setTriggerZipModal(false);
    setSelectedSlug("");
  }, []);

  const sorted = [...services].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
  );

  return (
    <>
      <Dialog
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) resetPicker();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-left text-xl text-[#0b1b3f]">
            What service do you need?
          </DialogTitle>
          <DialogDescription className="text-left text-base text-gray-600">
            {/* Choose a  service */}
          </DialogDescription>

          {sorted.length === 0 ? (
            <p className="text-sm text-gray-600">
              No services are available right now. Please try again later.
            </p>
          ) : (
            <>
              <label htmlFor="contact-service-select" className="sr-only">
                Service
              </label>
              <select
                id="contact-service-select"
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full min-h-[48px] rounded-md border border-gray-300 bg-white px-3 py-3 text-base text-[#0b1b3f] focus:border-[#28a745] focus:outline-none focus:ring-2 focus:ring-[#28a745]/30"
              >
                <option value="">Select a service</option>
                {sorted.map((s) => (
                  <option key={s.slug} value={s.slug} className="text-base bg-white p-2">
                    {s.title}
                  </option>
                ))}
              </select>

              {fetchError && (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {fetchError}
                </p>
              )}

              <Button
                type="button"
                className="w-full min-h-[48px] bg-[#28a745] text-base font-semibold hover:bg-[#22963c]"
                disabled={!selectedSlug || loading}
                onClick={handleContinue}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                    Loading…
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {serviceData && (
        <ZipSearchForm
          key={serviceData.slug}
          serviceData={serviceData}
          projectId={serviceData.slug}
          service={serviceData.slug}
          hero={false}
          onStatusChange={() => { }}
          onZipLocations={() => { }}
          triggerModal={triggerZipModal}
          onTriggerModalReset={() => setTriggerZipModal(false)}
          onModalSessionEnd={handleModalSessionEnd}
        />
      )}
    </>
  );
}
