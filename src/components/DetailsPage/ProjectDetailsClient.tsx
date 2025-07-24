"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import DetailPageLoader from "@/components/DetailsPage/Dotloading";

const ZipSearchForm = dynamic(
  () => import("@/components/DetailsPage/ZipSearchForm/ZipSearchForm"),
  {
    ssr: true,
    loading: () => <div className="h-12 bg-gray-200 animate-pulse"></div>,
  }
);

interface ZipDetails {
  city: string;
  state: string;
}

interface ProjectDetailsClientProps {
  serviceData: any;
}

const ProjectDetailsClient = ({ serviceData }: ProjectDetailsClientProps) => {
  const [zipStatus, setZipStatus] = useState<string | null>(null);
  const [zipDetails, setZipDetails] = useState<ZipDetails | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userState, setUserState] = useState<string>("Unknown");

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 0);
      });
    };

    const fetchLocation = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/ipinfo`,
          {
            headers: {
              "Cache-Control": "max-age=3600",
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch location data:", response.statusText);
          return;
        }

        const data = await response.json();
        if (data.state && data.state !== "Unknown") {
          setUserState(data.state);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    fetchLocation();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="relative max-w-3xl mx-auto px-2 md:px-6 py-4 md:py-8 text-gray-800 z-20 flex items-center justify-between flex-col">
        <div className="text-center mb-4 md:mb-10">
          <h1 className="text-3xl lg:text-[56px] font-bold mb-4 lg:leading-snug text-white">
            {serviceData.heroHeading}
            <span className="font-extrabold text-white"> {userState}</span>{" "}
            {serviceData.hasQuestionMark ? "?" : ""}
          </h1>
        </div>

        <Suspense fallback={<DetailPageLoader />}>
          <ZipSearchForm
            projectId={serviceData.slug}
            service={serviceData.slug}
            onStatusChange={setZipStatus}
            onZipLocations={setZipDetails}
            serviceData={serviceData}
            hero={true}
          />
        </Suspense>

        {zipStatus && (
          <div className="flex items-start w-[350px] md:w-[370px]">
            <p
              className={`mt-1 text-sm font-medium text-white ${
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

        <p className="text-base text-center font-medium text-white mt-2">
          {serviceData.afterCTAText}
        </p>
      </div>
    </>
  );
};

export default ProjectDetailsClient;
