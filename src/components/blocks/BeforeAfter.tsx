"use client";
import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BeforeAfterImage {
  id: string;
  alt?: string;
  url: string;
  width?: number;
  height?: number;
}

interface BeforeAfterBlockProps {
  id: string;
  headerTitle: string;
  headerDescription?: string;
  beforeImage: BeforeAfterImage;
  afterImage: BeforeAfterImage;
  backgroundColor?: string | null;
  blockName?: string | null;
}

const BeforeAfter: React.FC<BeforeAfterBlockProps> = ({
  id,
  headerTitle,
  headerDescription,
  beforeImage,
  afterImage,
  backgroundColor,
  blockName,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // Start at 50% (middle)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setSliderPosition(percentage);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setSliderPosition(percentage);
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for mouse and touch events
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return (
    <section
      id={blockName || `block-${id}`}
      className="py-12"
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      <div className="max-w-[1320px] mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{headerTitle}</h2>
          {headerDescription && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {headerDescription}
            </p>
          )}
        </div>

        {/* Before/After Slider Section */}
        <div className="max-w-4xl mx-auto">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg shadow-lg cursor-ew-resize select-none"
            style={{ aspectRatio: "16/9" }}
          >
            {/* After Image (Background) */}
            <div className="absolute inset-0">
              <Image
                src={afterImage.url}
                alt={afterImage.alt || "After image"}
                fill
                className="object-cover"
                quality={90}
                priority
              />
              {/* After Label */}
              <div className="absolute bottom-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                After
              </div>
            </div>

            {/* Before Image (Clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              }}
            >
              <Image
                src={beforeImage.url}
                alt={beforeImage.alt || "Before image"}
                fill
                className="object-cover"
                quality={90}
                priority
              />
              {/* Before Label */}
              <div className="absolute bottom-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                Before
              </div>
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-20"
              style={{ left: `${sliderPosition}%` }}
            />

            {/* Slider Handle */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-30"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <div className="bg-white rounded-full p-2 shadow-lg border-2 border-gray-300 cursor-ew-resize hover:scale-110 transition-transform">
                <div className="flex items-center">
                  <ChevronLeft className="w-3 h-3 text-gray-600" />
                  <ChevronRight className="w-3 h-3 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Drag the slider to compare before and after
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
