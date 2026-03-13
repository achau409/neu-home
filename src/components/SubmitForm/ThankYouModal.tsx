"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HERO_BLUR_DATA_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface ThankYouModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  companyName: string;
  heroImage: string;
  contactPhone: string;
  service: string;
  customerLogo: string;
}

const ThankYouModal = ({
  isOpen,
  setIsOpen,
  companyName,
  heroImage,
  contactPhone,
  customerLogo,
}: ThankYouModalProps) => {
  const router = useRouter();

  const handleReturn = () => {
    setIsOpen(false);
    router.push("/");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-full w-full h-[100dvh] p-0 rounded-lg text-[#0b1b3f] overflow-y-auto">
        <DialogTitle className="sr-only">Thank You</DialogTitle>
        <div className="min-h-full bg-white">
          <section className="relative min-h-full">
            <div className="relative w-full h-screen">
              <Image
                src={heroImage}
                alt="Background Image"
                fill
                className="object-cover"
                quality={75}
                priority
                placeholder="blur"
                blurDataURL={HERO_BLUR_DATA_URL}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b1b3fc6] to-[#0b1b3fbe] z-10" />
            </div>

            <div className="absolute inset-0 z-20 px-4 flex flex-col min-h-full">
              <div className="pt-4 pb-2 max-w-[1320px] mx-auto w-full">
                <div className="flex items-center justify-between">
                  <Image
                    src="/images/logo_in.svg"
                    alt="Logo"
                    width={140}
                    height={140}
                  />
                  {customerLogo && (
                    <Image
                      src={customerLogo}
                      alt="Customer Logo"
                      width={150}
                      height={150}
                    />
                  )}
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center py-4">
                <div className="max-w-2xl mx-auto text-center">
                  <h1 className="text-4xl font-bold mb-6 text-white">
                    Thank You!
                  </h1>

                  <div className="mb-4">
                    <div className="w-16 h-16 bg-[#28a745] rounded-full mx-auto flex items-center justify-center">
                      <svg
                        className="w-14 h-14 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <p className="text-xl mb-10 text-white">
                    Your estimator from <strong>{companyName}</strong> will call
                    you within the next 5-10 minutes.
                  </p>

                  <div className="mb-6">
                    <h2 className="text-xl text-left md:text-center font-bold mb-4 text-white">
                      What to Expect:
                    </h2>
                    <div className="space-y-4 text-left max-w-md mx-auto">
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6 text-white"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="md:text-xl text-base text-white">Quick 10-minute call</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6 text-white"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.54 15h6.42l.5 1.5H8.29l.5-1.5zm8.085-8.995a.75.75 0 10-.75-1.299 12.81 12.81 0 00-3.558 3.05L11.03 8.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 001.146-.102 11.312 11.312 0 013.612-3.321z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="md:text-xl text-base text-white">Confirm project goals</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6 text-white"
                          >
                            <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                            <path
                              fillRule="evenodd"
                              d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="md:text-xl text-base text-white">
                          Schedule your free in-home estimate
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#fffff0] rounded-lg p-4 mb-4 max-w-md mx-auto">
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-8 h-8 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-2xl ml-3 font-bold">4.9</span>
                    </div>
                    <p className="text-xl font-bold">1,500+ Happy Homeowners</p>
                  </div>

                  {contactPhone && (
                    <p className="text-lg mb-8 text-white">{contactPhone}</p>
                  )}

                  <button
                    onClick={handleReturn}
                    className="bg-[#28a745] text-white mt-4 px-8 py-3 rounded-lg text-xl font-semibold hover:bg-[#2a4c71] transition-colors inline-block cursor-pointer mb-4"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThankYouModal;
