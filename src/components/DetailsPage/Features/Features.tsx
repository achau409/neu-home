import { SquareCheckBig } from "lucide-react";
import Image from "next/image";

interface FeaturesProps {
  featuresData: any;
}

const Features = ({ featuresData }: FeaturesProps) => {
  return (
    <section className="bg-[#e6f0ff] py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="md:text-[2.5rem] text-[1.5rem] font-bold text-center tracking-[-0.5px] leading-tight">
          {featuresData.sectionTitle || "Features"}
        </h2>
        <h3 className="text-[15px] md:text-lg text-gray-600 mb-8 font-semibold tracking-tighter">
          {featuresData.description}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 mx-auto">
          {featuresData.images.map((image: any, index: any) => (
            <div key={index} className="relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-sm">
              <Image
                src={image.image.url}
                alt={`Feature image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, 50vw"
                quality={90}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {featuresData.featureList.map((feature: any, index: any) => (
            <div key={index} className="flex items-start">
              <SquareCheckBig
                strokeWidth={2}
                size={24}
                className="text-[#4CAF78] mr-3 mt-0.5 shrink-0"
              />
              <p className="leading-relaxed font-semibold md:text-[1.05rem] text-[15px] text-gray-800">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;