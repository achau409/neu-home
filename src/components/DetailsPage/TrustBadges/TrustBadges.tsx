import Image from "next/image";
import React from "react";

type BadgeIcon = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

type TrustSignal = {
  id: string;
  text: string;
};

type Badge = {
  id: string;
  name: string;
  icon: BadgeIcon;
  description: string;
  subtitle: string;
  trustSignals?: TrustSignal[];
};

type TrustBadgesProps = {
  badges?: Badge[];
  trustSignals?: TrustSignal[];
};

/**
 * TrustBadges — Showcases badges from CMS (Google, Trustpilot, BBB, etc.) to boost conversion.
 */
const RATING_BADGES = ["Google", "Trustpilot"];
const STAR_COLORS: Record<string, string> = {
  Google: "fill-amber-400",
  Trustpilot: "fill-[#00b67a]",
};

const TrustBadges = ({ badges = [], trustSignals: blockTrustSignals = [] }: TrustBadgesProps) => {
  const allTrustSignals = React.useMemo(() => {
    const fromBadges = badges.flatMap((b) => b.trustSignals ?? []);
    const combined = blockTrustSignals.length > 0 ? blockTrustSignals : fromBadges;
    const seen = new Set<string>();
    return combined.filter((s) => {
      if (seen.has(s.text)) return false;
      seen.add(s.text);
      return true;
    });
  }, [badges, blockTrustSignals]);

  if (!badges?.length) return null;

  return (
    <section
      className="bg-white  py-8 md:py-10 max-w-[380px] md:max-w-full mx-auto "
      aria-labelledby="credibility-heading"
    >
      <h2 id="credibility-heading" className="sr-only">
        Trusted by homeowners — verified reviews and ratings
      </h2>

      <div className="mx-auto max-w-[880px] px-2 sm:px-6">
        {/* <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
          Trusted &amp; Verified
        </p> */}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center justify-center content-center">
          {badges.map((badge, index) => (
            <div
              key={badge.id}
              className={`flex items-center md:gap-3 gap-2 min-w-0 ${index === badges.length - 1 && badges.length % 2 === 1 ? "col-span-2 w-full justify-center md:col-span-1" : ""}`}
            >
              <div className="flex-shrink-0 md:w-12 md:h-12 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center overflow-hidden">
                <Image
                  src={badge.icon?.url}
                  alt={badge.icon?.alt ?? badge.name}
                  width={badge.icon?.width ?? 48}
                  height={badge.icon?.height ?? 48}
                  className="md:w-7 md:h-7 w-5 h-5 object-contain"
                />
              </div>
              <div>
                {RATING_BADGES.includes(badge.name) ? (
                  <>
                    <div className="flex items-center md:gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg
                          key={i}
                          className={`md:w-4 md:h-4 w-3 h-3 ${STAR_COLORS[badge.name] ?? "fill-amber-400"}`}
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-xs md:text-base font-bold text-gray-900">{badge.description}</span>
                    </div>
                    <p className="md:text-xs text-[10px] text-gray-500 mt-0.5">{badge.subtitle}</p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-bold text-gray-900">{badge.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{badge.subtitle}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {allTrustSignals.length > 0 && (
          <div className="mt-6 flex justify-center md:gap-x-6 gap-x-2  gap-y-2 text-[10px] text-gray-500">
            {allTrustSignals.map((signal) => (
              <span key={signal.id} className="inline-flex items-center gap-1.5">
                <svg className="md:w-4 md:h-4 w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {signal.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrustBadges;
