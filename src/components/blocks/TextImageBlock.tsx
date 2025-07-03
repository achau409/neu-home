import React from "react";
import Image from "next/image";

interface ImageType {
  url?: string;
  alt?: string;
  // Add other properties as needed
}

interface TextImageBlockProps {
  id: string;
  heading?: string;
  subheading?: string;
  image: ImageType;
  rounded?: boolean | null;
  textAlign?: "left" | "center" | "right";
  imagePosition?: "top" | "bottom" | "left" | "right";
  blockName?: string | null;
  backgroundColor?: string | null;
}

const TextImageBlock: React.FC<TextImageBlockProps> = ({
  id,
  heading,
  subheading,
  image,
  rounded,
  textAlign = "left",
  imagePosition = "right",
  blockName,
  backgroundColor,
}) => {
  const textAlignClass = {
    left: "md:text-left text-center",
    center: "text-center",
    right: "text-right",
  }[textAlign];

  const isVertical = imagePosition === "top" || imagePosition === "bottom";
  const imageFirst = imagePosition === "top" || imagePosition === "left";

  // Create the content elements
  const ImageElement = (
    <div
      className={`${
        isVertical ? (imagePosition === "top" ? "mb-6" : "mt-6") : ""
      } ${imagePosition === "left" ? "md:w-1/4" : ""}`}
    >
      {image && image.url ? (
        <div
          className={`relative w-full max-w-[665px] h-auto mx-auto ${
            rounded ? "rounded-lg overflow-hidden" : ""
          }`}
        >
          <Image
            src={image.url}
            alt={image.alt || "Project image"}
            width={1200}
            height={800}
            className="object-contain w-full h-auto mx-auto"
          />
        </div>
      ) : (
        <div className="w-full h-64 md:h-80 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Image not available</p>
        </div>
      )}
    </div>
  );

  const TextElement = (
    <div
      className={`${textAlignClass} ${
        imagePosition === "left" ? "md:w-3/4" : ""
      }`}
    >
      {heading && (
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{heading}</h2>
      )}
      {subheading && <p className="text-lg text-gray-700">{subheading}</p>}
    </div>
  );

  return (
    <section
      id={blockName || `block-${id}`}
      className="py-12"
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      <div className="max-w-[1320px] mx-auto">
        {isVertical ? (
          <div className="flex flex-col">
            {imagePosition === "top" ? (
              <>
                {ImageElement}
                {TextElement}
              </>
            ) : (
              <>
                {TextElement}
                {ImageElement}
              </>
            )}
          </div>
        ) : (
          <div
            className={`flex flex-col md:flex-row gap-8 items-center justify-center ${
              !imageFirst ? "md:flex-row-reverse" : ""
            }`}
          >
            {imageFirst ? (
              <>
                {ImageElement}
                {TextElement}
              </>
            ) : (
              <>
                {TextElement}
                {ImageElement}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TextImageBlock;
