"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, MapPin, Quote, Star } from "lucide-react";
import Image from "next/image";
import TextBlock from "@/components/blocks/TextBlockLexical";

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-4 h-4"
          style={{
            fill: star <= rating ? "#FBBF24" : "none",
            color: star <= rating ? "FBBF24" : "#0b1b3f30",
            strokeWidth: 1.5,
          }}
        />
      ))}
    </div>
  );
};

const TestimonialsSlider = ({
  testimonials,
  sectionTitle,
}: {
  testimonials: {
    name: string;
    location: string;
    zipCode: string;
    rating?: number;
    image?: { url: string };
    testimonial: unknown;
  }[];
  sectionTitle: string;
}) => {
  return (
    <section className="relative pt-20 px-4  overflow-hidden pb-8">
      {/* Aggregate rating summary */}
      <div className="flex items-center justify-center mb-10 mt-4">
        <div className="inline-flex items-center gap-5 px-8 py-5 rounded-2xl px_40px_rgba(11,27,63,0.15)]">
          <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-white shadow-lg shrink-0 p-1.5 ring-2 ring-amber-100">
            <svg viewBox="0 0 24 24" className="w-9 h-9 md:w-10 md:h-10">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#0b1b3f]/60 text-xs font-semibold uppercase tracking-wider">Google Reviews</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 md:w-6 md:h-6 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[#0b1b3f] font-black text-xl md:text-2xl">4.9</span>
            </div>
            <span className="text-[#0b1b3f]/70 text-sm font-medium">based on 1,500+ reviews</span>
          </div>
        </div>
      </div>

      <div className="relative max-w-[1180px] mx-auto px-6">
        {/* Section header */}
        <div className="flex flex-col items-center mb-14">
          <h2
            className="text-2xl md:text-[40px] font-black text-center text-[#0b1b3f]  leading-relaxed tracking-tight mb-8"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {sectionTitle || "What Our Customers Are Saying"}
          </h2>

        </div>
        {/* Slider */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial.name || index} className="h-auto py-2 px-1">
                <div className="relative flex flex-col h-full bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(11,27,63,0.08)] ">

                  {/* Location badge — top hero strip */}
                  <div className="flex items-center gap-2 bg-[#f4faf7] border-b border-[#55BC7E]/20 px-4 py-3">
                    <MapPin className="w-3.5 h-3.5 text-[#55BC7E] shrink-0" />
                    <span className="text-[#0b1b3f] text-xs font-bold tracking-widest capitalize truncate">
                      {testimonial.location}
                    </span>
                    <span className="ml-auto bg-[#55BC7E]/15 text-[#55BC7E] text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded-md shrink-0">
                      {testimonial.zipCode}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 p-6">

                    {/* Rating row */}
                    <div className="mb-4">
                      <StarRating rating={5} />
                    </div>

                    {/* Oversized quote mark */}
                    <Quote className="w-8 h-8 text-[#55BC7E]/25 mb-3 -ml-1" />

                    {/* Testimonial text */}
                    <div className="flex-1 text-[#0b1b3f]/65 text-sm leading-relaxed">
                      <TextBlock
                        block={{
                          blockType: "testimonial",
                          testimonial: testimonial.testimonial,
                        }}
                      />
                    </div>

                    {/* Divider */}
                    <div className="my-5 h-px bg-[#0b1b3f]/8" />

                    {/* Author row */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <svg stroke="currentColor" fill="#0b1b3f" strokeWidth="0" viewBox="0 0 512 512" className="text-secondary-lighter" height="2rem" width="2rem" xmlns="http://www.w3.org/2000/svg"><path d="M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"></path></svg>
                      </div>
                      <div>
                        <p className="text-[#0b1b3f] text-[15px] font-bold leading-tight">
                          {testimonial.name}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nav buttons */}
          <button
            className="custom-prev absolute top-1/2 -left-5 md:-left-14 z-10 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#0b1b3f]/10 text-[#0b1b3f] hover:bg-[#55BC7E] hover:text-white hover:border-[#55BC7E] transition-all duration-200 shadow-[0_2px_12px_rgba(11,27,63,0.1)]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="custom-next absolute top-1/2 -right-5 md:-right-14 z-10 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#0b1b3f]/10 text-[#0b1b3f] hover:bg-[#55BC7E] hover:text-white hover:border-[#55BC7E] transition-all duration-200 shadow-[0_2px_12px_rgba(11,27,63,0.1)]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section >
  );
};

export default TestimonialsSlider;