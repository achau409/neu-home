import React from "react";
import Image from "next/image";

const WorksSections = ({ howItWorkBlock }: { howItWorkBlock: any }) => {
  const cards = howItWorkBlock.cards;
  return (
    <section className="relative bg-navy-deep text-white py-14 px-6 overflow-hidden">
      <div className="relative max-w-[1180px] mx-auto text-center">
        <h2 className="text-3xl font-bold mb-14">
          {howItWorkBlock.sectionTitle || "How it works?"}
        </h2>

        {/* Cards wrapper — position relative so the dashed line can be anchored inside */}
        <div className="relative">
          {/* Single dashed line: 90% wide, vertically centered on the circles (circle = 96px tall, center = 48px) */}
          <div
            className="hidden lg:block absolute left-[20%] right-[20%] pointer-events-none"
            style={{ top: "48px" }}
          >
            <svg
              width="100%"
              height="2"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke="white"
                strokeOpacity="0.6"
                strokeWidth="2"
                strokeDasharray="10 7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Cards row — z-10 so they sit above the line */}
          <div className="flex flex-col lg:flex-row items-start justify-around gap-6 md:gap-0 lg:px-24">
            {cards.map((card: any, index: number) => (
              <React.Fragment key={card.id}>
                {/* Card */}
                <div className="flex flex-col items-center text-center w-full  px-4">
                  {/* Circle with icon + number badge */}
                  <div className="relative mb-6">
                    {/* Outer glow ring */}
                    <div className="w-26 h-26 rounded-full bg-palette-ice-blue/90 flex items-center justify-center">
                      {/* Inner white circle */}
                      <div className="w-24 h-24 rounded-full bg-white shadow-[0_0_30px_8px_rgba(255,255,255,0.35)] flex items-center justify-center">
                        <Image
                          src={card.cardImage.url}
                          width={60}
                          height={60}
                          alt={card.heading}
                          className="w-12 h-12 object-cover"
                        />
                      </div>
                    </div>

                    {/* Number badge */}
                    <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-navy-brand text-white text-base font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-4 leading-snug">
                    {card.heading}
                  </h3>
                  <p className="text-base text-gray-300 leading-relaxed max-w-[200px]">
                    {card.subheading}
                  </p>
                </div>

              </React.Fragment>))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorksSections;