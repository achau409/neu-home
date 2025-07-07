"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/types/hero";
import Image from "next/image";

interface InspirationProps {
  images: Media[];
  sectionTitle: string;
}

const Inspirations = ({ images, sectionTitle }: InspirationProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto advance slides
  useEffect(() => {
    if (!images || images.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => {
        const nextIndex = current + 1;
        console.log(
          `Auto advancing from ${current} to ${
            nextIndex >= images.length ? 0 : nextIndex
          }`
        );
        return nextIndex >= images.length ? 0 : nextIndex;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [images]);

  const handlePrevious = () => {
    const prevIndex = activeIndex - 1;
    const newIndex = prevIndex < 0 ? images.length - 1 : prevIndex;
    console.log(`Previous clicked: ${activeIndex} -> ${newIndex}`);
    setActiveIndex(newIndex);
  };

  const handleNext = () => {
    const nextIndex = activeIndex + 1;
    const newIndex = nextIndex >= images.length ? 0 : nextIndex;
    console.log(`Next clicked: ${activeIndex} -> ${newIndex}`);
    setActiveIndex(newIndex);
  };

  const handleDotClick = (index: number) => {
    console.log(`Dot clicked: ${activeIndex} -> ${index}`);
    setActiveIndex(index);
  };

  if (!images || images.length === 0) {
    return null;
  }

  console.log(`Rendering with ${images.length} images, active: ${activeIndex}`);

  return (
    <section className="py-12 overflow-hidden md:px-6">
      <div className="max-w-[1180px] mx-auto px-2">
        <h2 className="text-4xl font-semibold text-center mb-12 text-gray-800">
          {sectionTitle || "Inspirations"}
        </h2>

        <div className="relative">
          {/* Image Container */}
          <div className="relative w-full h-[250px] md:h-[400px] rounded-sm overflow-hidden shadow-lg bg-gray-100">
            {images.map((image: any, index) => (
              <div
                key={`image-${index}`}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === activeIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={image.image.url}
                  alt={`Inspiration ${index + 1}`}
                  className="w-full h-full object-cover"
                  width={1000}
                  height={1000}
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {images.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-8 bg-[#28a745]"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Inspirations;
