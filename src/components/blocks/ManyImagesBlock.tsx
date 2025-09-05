import React from "react";
import Image from "next/image";

interface ApiImage {
  id: number;
  url: string;
  alt?: string;
}

interface ImageWrapper {
  id: string;
  image: ApiImage | null;
}

interface ManyImagesBlockProps {
  id: string;
  images: ImageWrapper[];
  blockName?: string | null;
  backgroundColor?: string | null;
  isTopPosition?: boolean;
}

const ManyImagesBlock: React.FC<ManyImagesBlockProps> = ({
  id,
  images,
  blockName,
  backgroundColor,
  isTopPosition,
}) => {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <section
      id={blockName || `block-${id}`}
      className={`py-4 pb-12 ${isTopPosition ? "mt-12 bg-gray-50" : ""}`}
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      <div className="flex flex-wrap gap-4 justify-center items-center">
        {images.map((item, index) => {
          const img = item.image; // could be null
          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg"
            >
              {img && img.url ? (
                <Image
                  src={img.url}
                  alt={img.alt || "Project image"}
                  width={500}
                  height={500}
                  className="w-[150px] h-[150px] object-contain"
                />
              ) : (
                <div className="w-[150px] h-[150px] bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Image not available</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ManyImagesBlock;
