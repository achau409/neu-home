"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Service } from "@/types/service";

const Navbar = ({
  header,
  services,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  header: any;
  services: Service[];
  publishedServices: Service[];
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [customerLogoUrl, setCustomerLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Read query params after hydration — avoids useSearchParams / Suspense issues
  useEffect(() => {
    const logoParam = new URLSearchParams(window.location.search).get("customerLogo");
    if (logoParam) {
      try {
        setCustomerLogoUrl(JSON.parse(logoParam));
      } catch {
        // ignore invalid JSON
      }
    }
  }, []);

  const pathname = usePathname();
  const hiddenNavPaths = ["/terms", "/contact-us", "/privacy-policy"];
  const isHomePage = pathname === "/";

  const getMatchService = (svcs: Service[], path: string) => {
    if (path.startsWith("/thank-you/")) {
      const slug = path.split("/")[2];
      if (slug) return svcs.find((s) => s.slug === slug);
    }
    return svcs.find((s) => path === `/${s.slug}`) || null;
  };

  const matchedService = !isHomePage ? getMatchService(services, pathname) : null;

  const shouldShowCustomerLogo =
    !isHomePage &&
    !hiddenNavPaths.includes(pathname) &&
    (customerLogoUrl || matchedService?.customerLogo);

  const logoUrl = customerLogoUrl || matchedService?.customerLogo?.url || "";

  return (
    <nav
      className={`px-4 w-full ${isScrolled ? "bg-white shadow-md" : "bg-[#0b1b3f]"}`}
    >
      <div className="container mx-auto px-4 py-2 max-w-[1180px]">
        <div
          className={`py-3 flex items-center ${
            matchedService ? "justify-center" : "justify-between"
          }`}
        >
          {matchedService && shouldShowCustomerLogo ? (
            <div className="w-0" />
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
                <Image src={logoUrl} alt="Customer-Logo" width={142} height={142} />
              ) : (
                <Link href="/">
                  <Image src={logoUrl} alt="Customer-Logo" width={142} height={142} />
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
