"use client";
import React from "react";
import CountUp from "react-countup";
import { HousePlus, UserRoundPen, UsersRound } from "lucide-react";
import Image from "next/image";
interface Stat {
  id: number;
  value: number;
  label: string;
  bgColor?: string;
  img: JSX.Element;
}

const stats: Stat[] = [
  {
    id: 1,
    img: <UserRoundPen className="w-16 h-16 text-gray-300" />,
    value: 10147,
    label: "Requests submitted",
  },
  {
    id: 2,
    img: <UsersRound className="w-16 h-16  text-gray-300" />,
    value: 2537,
    label: "Estimates given",
  },
  {
    id: 3,
    img: <HousePlus className="w-16 h-16" />,
    value: 761,
    label: "Projects Completed",
    bgColor: "bg-[#55bc7e] text-white",
  },
];

const HomeOwnersHelped = ({ statisticBlock }: { statisticBlock: any }) => {
  const stats = statisticBlock.cards;
  return (
    <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-0">
      <div className="max-w-[1180px] mx-auto text-center">
        <h2 className="text-4xl font-medium mb-12">
          Homeowners We Have Helped
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat: any) => (
            <div
              key={stat.id}
              className={`flex flex-col items-center justify-center px-6 py-10 ${
                stat.backgroundColor || "bg-white text-gray-500"
              }`}
              style={{
                backgroundColor: stat.backgroundColor,
                color: stat.backgroundColor ? "white" : "gray-500",
              }}
            >
              <div>
                <Image
                  src={stat.cardIcon.url}
                  alt={stat.cardIcon.alt}
                  width={50}
                  height={50}
                />
              </div>
              <h3 className="text-3xl font-bold">
                <CountUp
                  start={5}
                  end={stat.total}
                  duration={1.5}
                  separator=","
                  preserveValue={true}
                />
              </h3>
              <p className="text-xl font-semibold mt-2">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeOwnersHelped;
