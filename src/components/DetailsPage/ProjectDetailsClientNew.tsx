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
  initialUserCity?: string;
}

const ProjectDetailsClientNew = ({ serviceData, initialUserCity = "" }: ProjectDetailsClientProps) => {
  const [zipStatus, setZipStatus] = useState<string | null>(null);
  const [zipDetails, setZipDetails] = useState<ZipDetails | null>(null);
  const [userCity] = useState<string>(initialUserCity);
  const [floatingTrigger, setFloatingTrigger] = useState(false);
  const heroRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <div className="relative z-[50] w-full  mx-auto px-4 md:px-6 flex flex-col items-center text-center">

      {/* Eyebrow pill */}
      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
        <span className="text-white text-[12px] md:text-xs font-bold tracking-widest uppercase">
          ★ Free quote · No obligation
        </span>
      </div>

      {/* Main heading */}
      <h1 className={`text-[34px]  justify-center  md:text-5xl lg:text-[56px] font-extrabold lg:leading-[1.1] leading-tight tracking-[-1.5px] text-white mb-3 max-w-${serviceData.heroTextWidth} text-center`}>
        {serviceData.heroHeading}
        {serviceData.hasLocation && (
          <span className="text-green-400"> {userCity}
          </span>
        )}
        {serviceData.hasQuestionMark ? "?" : ""}
      </h1>

      {/* Google trust badge — compact inline row */}
      <div className="flex items-center justify-center gap-2 mb-8 mt-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}

            <span className="text-white font-bold text-sm">4.9 </span>
          </div>

          <div className="text-gray-300 text-xs">based on 1500+ reviews</div>

        </div>

      </div>

      {/* ZIP form — narrow, clean, no heavy card header */}
      {/* <div ref={heroRef} className="w-full max-w-2xl px-5 py-2">
        <Suspense fallback={<DetailPageLoader />}>
          <ZipSearchForm
            projectId={serviceData.slug}
            service={serviceData.slug}
            onStatusChange={setZipStatus}
            onZipLocations={setZipDetails}
            serviceData={serviceData}
            hero={true}
            triggerModal={floatingTrigger}
            onTriggerModalReset={() => setFloatingTrigger(false)}
          />
        </Suspense>

        {zipStatus && (
          <p className={`mt-3 text-sm font-semibold ${zipStatus === "matched" ? "text-green-400" :
            zipStatus === "not_matched" ? "text-red-400" : "text-gray-300"
            }`}>
            {zipStatus === "matched"
              ? `✓ ${zipDetails?.city}, ${zipDetails?.state} — We service your area!`
              : zipStatus === "not_matched"
                ? "ZIP code is currently not serviced by our contractor."
                : zipStatus}
          </p>
        )}
      </div> */}

      {/* Disclaimer */}
      {serviceData.afterCTAText && (
        <p className="text-lg text-white  leading-relaxed font-[500] mb-16">
          {serviceData.heroSubHeading}
        </p>
      )}


    </div>
  );
};

export default ProjectDetailsClientNew;
