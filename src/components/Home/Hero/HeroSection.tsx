"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Hero } from "@/types/hero";
interface AllData {
  heroData: Hero;
  services: any;
}

const HeroSection = ({ heroData, services }: AllData) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleSelect = (id: string) => {
    setSelectedValue(id);
  };

  return (
    <section className="relative px-2 md:px-0  md:py-8 bg-gray-50 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroData.heroImage.url}
          alt="Background"
          width={1920}
          height={1080}
          quality={100}
          className="object-cover  object-center md:object-center w-full h-full"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1b3fc6] via-[#0b1b3feb] via-[60%] to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1180px] px-2 py-10 text-gray-950 h-full">
        {/* Heading Section */}
        <div className="mb-16 flex flex-col items-center justify-center">
          <div className=" h-[28px] mt-12 my-4 rounded-full"></div>
          <h1 className="text-3xl md:text-[56px] font-bold leading-tight mb-2 max-w-[500px] text-center text-white">
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
                className="w-full sm:w-[250px] px-4 py-2 text-left bg-white 
              rounded-sm md:rounded-l-sm md:rounded-r-none "
              >
                {selectedValue
                  ? services.find((item: any) => item.slug === selectedValue)
                      ?.title
                  : "Select project type"}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[250px]">
                {services.map((service: any) => (
                  <DropdownMenuItem
                    key={service.slug}
                    onClick={() => handleSelect(service.slug)}
                  >
                    {service.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Button */}
            <Link href={`/${selectedValue}`} passHref>
              <button
                className="w-full sm:w-auto min-w-[150px] px-4 py-2 bg-[#28a745] text-white
              rounded-sm md:rounded-r-sm md:rounded-l-none hover:bg-[#28a745]"
              >
                Get Estimate
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
