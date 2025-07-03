"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useSearchParams } from "next/navigation";
import { Service } from "@/types/service";

const Navbar = ({
  header,
  services,
  publishedServices,
}: {
  header: any;
  services: Service[];
  publishedServices: Service[];
}) => {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const searchParams = useSearchParams();
  const [customerLogoUrl, setCustomerLogoUrl] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedValue(id);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const logoParam = searchParams.get("customerLogo");
    if (logoParam) {
      try {
        const parsedLogo = JSON.parse(logoParam);
        setCustomerLogoUrl(parsedLogo);
      } catch (e) {
        console.error("Error parsing customer logo:", e);
      }
    }
  }, [searchParams]);

  const pathname = usePathname();
  const hiddenNavPaths = ["/terms", "/contact-us", "/privacy-policy"];
  // Check if current path is home page
  const isHomePage = pathname === "/";

  const getMatchService = (services: Service[], pathname: string) => {
    // Handle thank you page path
    if (pathname.startsWith("/thank-you/")) {
      const pathParts = pathname.split("/");
      const serviceSlug = pathParts[2];
      if (serviceSlug) {
        return services.find((service) => service.slug === serviceSlug);
      }
    }
    // Handle regular service pages
    const matchedService = services.find((service) =>
      pathname.includes(service.slug)
    );
    return matchedService || null;
  };

  const matchedService = !isHomePage
    ? getMatchService(services, pathname)
    : null;

  const shouldShowCustomerLogo =
    !isHomePage &&
    !hiddenNavPaths.includes(pathname) &&
    (customerLogoUrl || matchedService?.customerLogo);

  const logoUrl = customerLogoUrl || matchedService?.customerLogo?.url || "";

  return (
    <nav
      className={` px-4 w-full  ${
        isScrolled ? "bg-white shadow-md" : "bg-[#0b1b3f]"
      }`}
    >
      <div className="container mx-auto px-4 py-2 max-w-[1180px]">
        <div className="py-3 flex justify-between items-center">
          {matchedService ? (
            <Image
              src={header.headerLogo.url}
              alt="Neu-Logo"
              width={142}
              height={142}
            />
          ) : (
            <Link href="/">
              <Image
                src={header.headerLogo.url}
                alt="Neu-Logo"
                width={142}
                height={142}
              />
            </Link>
          )}
          {shouldShowCustomerLogo && logoUrl && (
            <div className="flex items-center gap-4">
              {matchedService ? (
                <Image
                  src={logoUrl}
                  alt="Customer-Logo"
                  width={142}
                  height={142}
                />
              ) : (
                <Link href="/">
                  <Image
                    src={logoUrl}
                    alt="Customer-Logo"
                    width={142}
                    height={142}
                  />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
