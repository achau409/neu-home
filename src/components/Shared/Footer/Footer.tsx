import Image from "next/image";
import Link from "next/link";

const Footer = ({ footer }: { footer: any }) => {
  return (
    <footer className="bg-navy-brand text-white px-2">
      <div className="mx-auto max-w-[1180px] py-6">
        <div className="mb-6 flex min-h-[56px] items-center">
          {footer?.footerLogo?.url ? (
            <Link href="/">
              <Image
                src={footer.footerLogo.url}
                alt="NEU Home Services logo"
                width={180}
                height={56}
                sizes="180px"
                className="h-[56px] w-[180px] object-contain"
              />
            </Link>
          ) : (
            <div className="h-[56px] w-[180px]" aria-hidden="true" />
          )}
        </div>
        <nav className="flex min-h-[60px] flex-col gap-4 md:flex-row md:gap-16 !text-[18px]">
          {footer?.footerLinks?.map((link: any) => (
            <Link href={link?.URL} key={link?.id} className="text-gray-300">
              {link?.linkText}
            </Link>
          ))}
          <a href="#cookie" className="text-gray-300 hover:text-blue-300">
            Cookie Policy
          </a>
          <a href="/contact-us" className="text-gray-300 hover:text-blue-300">
            Contact us
          </a>
        </nav>
        <div className="pt-8 text-sm text-gray-300">
          <p>{footer?.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
