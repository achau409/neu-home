"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Hero } from "@/types/hero";
import posthog from "posthog-js";
interface AllData {
  heroData: Hero;
  services: any;
}

const HeroSection = ({ heroData, services }: AllData) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleSelect = (id: string) => {
    setSelectedValue(id);
    const title = services.find((s: any) => s.slug === id)?.title;
    posthog.capture("service_selected", { service_slug: id, service_title: title, location: "hero" });
  };

  const handleGetEstimate = () => {
    if (!selectedValue) return;
    const title = services.find((s: any) => s.slug === selectedValue)?.title;
    posthog.capture("get_estimate_clicked", { service_slug: selectedValue, service_title: title, location: "hero" });
  };

  return (
    <section className="relative px-2 md:px-0  md:py-8 bg-gray-50 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroData.heroImage.url}
          alt={"Neu Home Service"}
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1b3fc6] via-[#0b1b3feb] via-[60%] to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1180px] px-2 py-10 text-gray-950 h-full">
        {/* Heading Section */}
        <div className="mb-16 flex flex-col items-center justify-center">
          <div className=" h-[28px] mt-12 my-4 rounded-full"></div>
          <h1 className="text-3xl md:text-[56px] font-bold leading-tight mb-2 max-w-5xl text-center text-white">
            {heroData.heading}
          </h1>
          <p className="text-sm md:text-3xl text-gray-200 leading-normal mb-6 ">
            {heroData.subheading}
          </p>
        </div>

        {/* Dropdown and Button Section */}
        <div>
          <div className="flex items-center justify-center gap-2 md:gap-0 rounded-lg mb-12">
            {/* Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="w-full sm:w-[250px] px-2 py-[11px] md:py-[8.7px] text-left bg-white text-sm md:text-base  
              rounded-sm md:rounded-l-sm md:rounded-r-none "
              >
                {selectedValue
                  ? services.find((item: any) => item.slug === selectedValue)
                    ?.title
                  : "Select project type"}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full sm:w-[250px] text-xs md:text-lg">
                {services.map((service: any) => (
                  <DropdownMenuItem
                    key={service.slug}
                    onClick={() => handleSelect(service.slug)}
                    className="cursor-pointer"
                  >
                    {service.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Button */}
            <Button
              asChild
              className="w-full sm:w-auto text-base min-w-[150px] px-4 !py-[21px] bg-[#55BC7E] text-white rounded-sm md:rounded-r-sm md:rounded-l-none hover:bg-[#28a745]"
              onClick={handleGetEstimate}
            >
              <Link href={selectedValue ? `/${selectedValue}` : "/"} aria-disabled={!selectedValue}>
                Get Estimate
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
