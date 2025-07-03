import React from "react";
import Image from "next/image";

interface ImageType {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface ImageBlockProps {
  id: string;
  image: ImageType;
  rounded?: boolean;
  blockName?: string | null;
  backgroundColor?: string | null;
}

const ImageBlock: React.FC<ImageBlockProps> = ({
  id,
  image,
  rounded,
  blockName,
  backgroundColor,
}) => {
  // Check if image exists and has a URL
  if (!image || !image.url) {
    console.log("Image not rendered:", image);
    return null;
  }

  return (
    <section
      id={blockName || `block-${id}`}
      className="py-4 pt-8"
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      <div className="max-w-[1320px] mx-auto">
        <div
          className={`relative ${rounded ? "rounded-lg overflow-hidden" : ""}`}
        >
          <Image
            src={image.url}
            alt={image.alt || "Project image"}
            width={1000}
            height={1000}
          className="w-full max-w-[1320px] h-auto mx-auto"
            style={{ maxWidth: image.width, height: image.height }}
          />
        </div>
      </div>
    </section>
  );
};

export default ImageBlock;
