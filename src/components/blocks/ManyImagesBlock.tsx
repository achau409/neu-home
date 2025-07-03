import React from "react";
import Image from "next/image";

interface ImageType {
  url?: string;
  alt?: string;
  // Add other properties as needed
}

interface ManyImagesBlockProps {
  id: string;
  images: ImageType[];
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
        {images.map((image: any, index) => (
          <div key={index} className="relative overflow-hidden rounded-lg">
            {image.image.url ? (
              <Image
                src={image.image.url}
                alt={image.image.alt || "Project image"}
                width={500}
                height={500}
                className="w-[150px] h-[150px] object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Image not available</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ManyImagesBlock;
