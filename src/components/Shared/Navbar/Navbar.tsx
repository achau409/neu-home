"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = ({
  header,
}: {
  header: any;
}) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Adjust the offset (e.g., -60) if you have a fixed/sticky navbar
      const topPos = element.offsetTop - 60; 
      window.scrollTo({
        top: topPos,
        behavior: 'smooth',
      });
      // Optional: ensure keyboard focus for accessibility
      element.setAttribute("tabindex", "-1");
      element.focus();
      element.removeAttribute("tabindex");
    }
  };
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToSection(id);
  };
    return (
    <nav
      aria-label="Primary"
      className={` px-4 w-full bg-navy-brands h-[85px]`}
    >
      <div className="container mx-auto px-4 py-2 max-w-[1180px]">
        <div className="py-3 flex justify-between items-center">
          <Link href="/">
            <Image
              src={header?.headerLogo?.urls || "/images/logo.svg"}
              alt="NEU Home Services logo"
              width={142}
              height={142}
              sizes="142px"
              className="h-auto w-[142px]"
              priority
              fetchPriority="high"
            />
          </Link>
          <div className="flex text-black font-semibold gap-4 md:gap-12 md:text-base text-sm">
            <Link href="#faq" onClick={(e) => handleNavClick(e, "faq")}>FAQ</Link>
            <Link href="#workflow" onClick={(e) => handleNavClick(e, "workflow")}>
              How it works
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;