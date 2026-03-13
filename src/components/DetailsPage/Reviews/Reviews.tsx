"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import Image from "next/image";
import TextBlock from "@/components/blocks/TextBlockLexical";

const TestimonialsSlider = ({
  testimonials,
  sectionTitle,
}: {
  testimonials: { name: string; image?: { url: string }; testimonial: unknown }[];
  sectionTitle: string;
}) => {
  return (
    <section className="pt-12 px-4">
      <div className="max-w-[1180px] mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          {sectionTitle || "What Our Customers Are Saying"}
        </h2>

        <div className="relative group">
          <Swiper
            modules={[Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="rounded-lg overflow-hidden"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial.name || index}>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                    {testimonial?.image?.url ? (
                      <Image
                        src={testimonial.image.url}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <UserRound className="w-10 h-10" />
                    )}
                  </div>
                  <h4 className="my-4 text-gray-900 font-bold">{testimonial.name}</h4>
                  <TextBlock
                    block={{
                      blockType: "testimonial",
                      testimonial: testimonial.testimonial,
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            className="custom-prev flex absolute top-1/2 -left-12 z-10 -translate-y-1/2"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            className="custom-next flex absolute top-1/2 -right-12 z-10 -translate-y-1/2"
            aria-label="Next slide"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
