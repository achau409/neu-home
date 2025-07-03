import Image from "next/image";
import Link from "next/link";

const Footer = ({ footer }: { footer: any }) => {
  return (
    <footer className="bg-[#0b1b3f] text-white px-2">
      <div className="mx-auto max-w-[1180px] py-4 ">
        <div className="mb-4">
          <Link href="/">
            <Image
              src={footer?.footerLogo?.url}
              alt="footerLogo"
              width={180}
              height={180}
            />
          </Link>
        </div>
        <nav className="flex flex-col md:flex-row gap-4 md:gap-16 !text-[18px]">
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
        <div className="text-sm mt-10 text-gray-300">
          <p>{footer?.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
