"use client";
import { useState, useEffect } from "react";
import supabase from "@/utils/supabase/client";
import { CircleCheckBig, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import SubmitForm from "@/components/SubmitForm/SubmitForm";
import { getAllServices } from "@/lib/api";

interface Project {
  id: string;
  title: string;
}

interface ZipSearchFormProps {
  onStatusChange: (status: string | null) => void;
  onZipLocations: (
    ZipLocations: { city: string; state: string } | null
  ) => void;
  projectId?: string | string[];
  service: string;
  deliveryEmail?: string;
  serviceData: any;
}
interface Locations {
  city: string;
  state: string;
}

const ZipSearchForm = ({
  onStatusChange,
  onZipLocations,
  projectId,
  service,
  serviceData,
}: ZipSearchFormProps) => {
  const [zipCode, setZipCode] = useState("");
  const [isMatched, setIsMatched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState<string>(serviceData.title);
  const [deliveryEmail, setDeliveryEmail] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [zipLocations, setZipLocations] = useState<Locations | null>(null);
  // access project title-----------------
  useEffect(() => {
    setProjectTitle(serviceData.title);
  }, [projectId]);

  // Validate ZIP Code using Supabase----------------
  const validateZipCode = async () => {
    if (!zipCode) {
      onStatusChange(null);
      onZipLocations(null);
      setIsMatched(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("ZIP Codes")
        .select(
          `Zip_Code, City, State,Service,"Company name","Lead Delivery Email"`
        )
        .eq("Zip_Code", zipCode)
        .eq("Service_Slug", service);
      if (data?.length) {
        const {
          ["Company name"]: companyName,
          City: city,
          State: state,
          ["Lead Delivery Email"]: leadEmail,
        } = data[0];

        onZipLocations({ city, state });
        setZipLocations({ city, state });
        setDeliveryEmail(leadEmail);
        setCompanyName(companyName);
        onStatusChange("matched");
        setIsMatched(true);
      } else {
        setIsMatched(false);
        onStatusChange("not_matched");
        onZipLocations(null);
      }
    } catch (error) {
      onStatusChange("Error checking ZIP code");
      onZipLocations(null);
      setIsMatched(false);
    }
  };

  useEffect(() => {
    validateZipCode();
  }, [zipCode]);

  // Open modal when ZIP code is matched----------------
  const handleStartEstimate = () => {
    if (isMatched) {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6 text-white">
        {serviceData.heroSubHeading ? serviceData.heroSubHeading : "Let's find out! Enter your ZIP code below"}
      </h3>
      <div className="flex justify-center items-center gap-3 relative px-2">
        <input
          type="text"
          placeholder="Enter ZIP code"
          aria-label="ZIP code"
          maxLength={5}
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="border border-gray-300 text-sm px-4 lg:px-6 py-4 rounded-md outline-none transition"
        />

        {isMatched && (
          <CircleCheckBig
            className="absolute text-[#28a745] w-5 h-5 top-1/2 transform -translate-y-1/2"
            aria-label="Matched"
          />
        )}

        <button
          onClick={handleStartEstimate}
          className={`${
            isMatched ? "bg-[#28a745]" : "bg-[#28a745] cursor-not-allowed"
          } text-sm text-white px-2 lg:px-4 py-4 rounded-md min-w-[150px]`}
          aria-disabled={!isMatched}
        >
          Start Free Estimate
        </button>
      </div>

      {/* Modal for Form content Submit-----------*/}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl w-full max-h-[80vh] sm:max-h-[90vh] p-6 overflow-y-auto rounded-lg">
          <DialogTitle></DialogTitle>
          <button
            className="absolute top-2 right-2 p-1 text-2xl z-20 rounded-full bg-opacity-70 bg-gray-600 text-white"
            onClick={() => setIsModalOpen(false)}
            aria-label="Close"
          >
            <X />
          </button>

          {/* submit form content imported-------- */}
          <SubmitForm
            service={service}
            projectTitle={projectTitle}
            zipCode={zipCode}
            zipLocation={zipLocations}
            targetEmail={deliveryEmail}
            projectId={projectId}
            companyName={companyName}
            questions={serviceData.questions}
            serviceData={serviceData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ZipSearchForm;
