"use client";
import React from "react";
import CountUp from "react-countup";
import Image from "next/image";

const HomeOwnersHelped = ({ statisticBlock }: { statisticBlock: any }) => {
  const stats = statisticBlock.cards;
  return (
    <section className="py-8 px-2 sm:px-6">
      <div className="max-w-[820px] mx-auto text-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {stats.map((stat: any, index: number) => (
            <div
              key={stat.id}
              className={`flex  rounded-xl flex-col items-center justify-center font-bold px-2 py-5 bg-white  text-navy-deep "} ${index === 2 ? "col-span-2 md:col-span-1" : ""}`}
            >
              <div className="flex gap-2 items-center">
                <Image
                  src={stat.cardIcon.url}
                  alt={stat.cardIcon.alt}
                  width={100}
                  height={100}
                  className="w-10 h-10 object-contain fill-black"
                />
                <h3 className="text-xl font-bold">
                  <CountUp
                    start={5}
                    end={stat.total}
                    duration={1.5}
                    separator=","
                    preserveValue={true}
                  />
                </h3>

              </div>
              <p className="md:text-xl text-sm font-bold">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeOwnersHelped;
