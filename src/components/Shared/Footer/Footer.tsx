"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { CONTACT_OPEN_ESTIMATE_EVENT } from "@/lib/contact-estimate-events";

const Footer = ({ footer }: { footer: any }) => {
  const copyright = footer?.footerCopyright || "© 2026 NEU";
  const pathname = usePathname();
  return (
    <footer className="w-full">
      {/* CTA Section — Lead generation / Final conversion point */}
      <section
        className="flex flex-col items-center justify-center px-4 py-[60px] md:py-20 text-center bg-[#0b1b3f]"
        aria-labelledby="footer-cta-heading"
      >
        <h2
          id="footer-cta-heading"
          className=" font-bold text-white text-2xl md:text-[40px] mb-3"
        >
          Ready to get started?
        </h2>
        <p className="text-white/95 text-base md:text-lg font-sans max-w-xl mb-8">
          Join thousands of homeowners who found their perfect pro.
        </p>
        {pathname === "/contact-us" ? (
          <Button
            type="button"
            className="rounded-lg bg-white hover:bg-black text-black font-semibold px-8 py-6 text-base transition-colors hover:text-white duration-300"
            onClick={() =>
              window.dispatchEvent(new CustomEvent(CONTACT_OPEN_ESTIMATE_EVENT))
            }
          >
            Get my free estimate
          </Button>
        ) : (
          <Button
            asChild
            className="rounded-lg bg-white hover:bg-black text-black font-semibold px-8 py-6 text-base transition-colors hover:text-white duration-300"
          >
            <Link href={`${pathname}#hero`}>Get my free estimate</Link>
          </Button>
        )}
      </section>

      {/* Footer Bar */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4 py-5 md:px-8">
        <nav
          className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-8"
          aria-label="Footer"
        >
          {footer?.footerLinks?.map((link: { id?: string; URL?: string; linkText?: string }) => (
            <Link
              key={link?.id}
              href={link?.URL ?? "#"}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              {link?.linkText}
            </Link>
          ))}
          <Link
            href="/contact-us"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            Contact Us
          </Link>
        </nav>
        <p className="text-gray-600 text-sm font-medium">{copyright}</p>
      </div>
    </footer>
  );
};

export default Footer;
