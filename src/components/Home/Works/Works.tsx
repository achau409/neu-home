import React from "react";
import Image from "next/image";

interface Work {
  id: number;
  title: string;
  description: string;
  img: string;
}

// Fake data----------
const works: Work[] = [
  {
    id: 1,
    title: "Share",
    description: "Share a few things about your home improvement project.",
    img: "/images/icon/icon-share.svg",
  },
  {
    id: 2,
    title: "Match",
    description: "Get matched with one of our friendly local contractors.",
    img: "/images/icon/icon-match.svg",
  },
  {
    id: 3,
    title: "Free Estimate",
    description:
      "One of our local contractors will get in touch to set up a 100% free estimate.",
    img: "/images/icon/icon-estimate.svg",
  },
];

const WorksSections = ({ howItWorkBlock }: { howItWorkBlock: any }) => {
  const cards = howItWorkBlock.cards;
  return (
    <section className="bg-[#0b1b3f]  text-white py-14 px-6">
      <div className="max-w-[1180px] mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-12">How it works?</h2>
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {cards.map((card: any, index: number) => (
            <div
              key={card.id}
              className="flex items-center justify-between my-5 lg:my-0"
            >
              <div className="relative flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-[#55bc7e] rounded-t-full rounded-bl-full absolute rotate-45"></div>
                <div className="relative z-10 p-2 rounded-full flex justify-center items-center">
                  <Image
                    src={card.cardImage.url}
                    width={50}
                    height={50}
                    alt="img"
                    className="w-14 h-14 mb-2"
                  />
                </div>
                <h3 className="text-xl font-medium relative z-10">
                  {card.heading}
                </h3>
                <p className="text-lg text-gray-300 relative z-10">
                  {card.subheading}
                </p>
              </div>
              {index < works.length - 1 && (
                <Image
                  src="/images/icon/angle-right.svg"
                  width={50}
                  height={50}
                  alt="img"
                  className="w-16 h-16 hidden lg:block translate-x-[20px] translate-y-[-70px]"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorksSections;
