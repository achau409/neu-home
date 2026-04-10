import { SquareCheckBig } from "lucide-react";
import Image from "next/image";

interface FeaturesProps {
  featuresData: any;
}

const Features = ({ featuresData }: FeaturesProps) => {
  return (
    <section className="py-12 bg-[#e6f0ff]">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="md:text-[2.5rem] text-[1.5rem] font-bold  text-center tracking-[-0.5px]">
          {featuresData.sectionTitle || "Features"}
        </h2>
        <h3 className="text-[15px] md:text-lg text-gray-600  mb-8 font-semibold tracking-tighter">{featuresData.description}</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 mx-auto">
          {featuresData.images.map((image: any, index: any) => (
            <Image
              key={index}
              src={image.image.url}
              alt={`Feature image ${index + 1}`}
              className="rounded-sm mx-auto w-full h-auto object-contain"
              width={1000}
              height={1000}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              quality={90}
              loading="lazy"
            />
          ))}        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {featuresData.featureList.map((feature: any, index: any) => (
            <div key={index} className="flex text-start">
              <SquareCheckBig
                strokeWidth={2}
                size={28}
                className="text-[#4CAF78] mr-3 !min-w-[28px] md:mt-1"
              />
              <p className="leading-relaxed font-semibold md:text-[1.05rem] text-[15px] text-gray-800">
                {feature.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
