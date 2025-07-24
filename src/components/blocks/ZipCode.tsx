"use client";
import React, { Suspense, useState } from "react";
import ZipSearchForm from "../DetailsPage/ZipSearchForm/ZipSearchForm";
import DetailPageLoader from "../DetailsPage/Dotloading";

interface ZipCodeBlockProps {
  id: string;
  heading: string;
  subheading: string;
  belowTextEnabled?: boolean;
  belowText?: string;
  backgroundColor?: string;
  blockName?: string | null;
  serviceData?: any;
}

const ZipCodeBlock: React.FC<ZipCodeBlockProps> = ({
  id,
  heading,
  subheading,
  belowTextEnabled,
  belowText,
  backgroundColor,
  blockName,
  serviceData,
}) => {
  const [zipStatus, setZipStatus] = useState<string | null>(null);
  const [zipDetails, setZipDetails] = useState<{
    city?: string;
    state?: string;
  } | null>(null);

  // Tailwind background color fallback
  const bgClass = backgroundColor ? "" : "bg-transparent";

  return (
    <div
      className={`flex flex-col items-center text-center my-6 p-6 w-full ${bgClass}`}
      style={backgroundColor ? { backgroundColor } : {}}
    >
      <h1 className="text-3xl lg:text-[56px] font-bold mb-3 lg:leading-snug   ">
        {heading}
      </h1>
      <h4 className="text-lg md:text-2xl font-semibold mb-4">{subheading}</h4>
      <div className="w-full flex flex-col items-center">
        <Suspense fallback={<DetailPageLoader />}>
          <ZipSearchForm
            projectId={serviceData?.slug}
            service={serviceData?.slug}
            onStatusChange={setZipStatus}
            onZipLocations={setZipDetails}
            serviceData={serviceData}
            hero={false}
          />
        </Suspense>
        {zipStatus && (
          <div className="flex items-start w-[350px] md:w-[370px] justify-center">
            <p
              className={`mt-1 text-sm font-medium text-white text-center ${
                zipStatus === "matched"
                  ? "text-[#28a745]"
                  : zipStatus === "not_matched"
                  ? "!text-red-600"
                  : "text-gray-600"
              }`}
            >
              {zipStatus === "matched"
                ? `${zipDetails?.city}, ${zipDetails?.state}`
                : zipStatus === "not_matched"
                ? "ZIP code is currently not serviced by our contractor."
                : zipStatus}
            </p>
          </div>
        )}
      </div>
      {belowTextEnabled && belowText && (
        <p className="text-base text-center font-medium  mt-2">{belowText}</p>
      )}
    </div>
  );
};

export default ZipCodeBlock;
