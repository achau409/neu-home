"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = ({
  header,
}: {
  header: any;
}) => {

  return (
    <nav
      aria-label="Primary"
      className={` px-4 w-full bg-navy-brand h-[85px]`}
    >
      <div className="container mx-auto px-4 py-2 max-w-[1180px]">
        <div className="py-3 flex justify-between items-center">
          <Link href="/">
            <Image
              src={header?.headerLogo?.url || "/images/logo_in.svg"}
              alt="NEU Home Services logo"
              width={142}
              height={142}
              sizes="142px"
              className="h-auto w-[142px]"
              priority
              fetchPriority="high"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;