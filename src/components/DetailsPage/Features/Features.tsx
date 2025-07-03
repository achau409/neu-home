import { Media } from "@/types/hero";
import { SquareCheckBig } from "lucide-react";
import Image from "next/image";

interface FeaturesProps {
  featuresData: any;
}

const Features = ({ featuresData }: FeaturesProps) => {
  return (
    <section className="py-12 bg-[#e6f0ff]">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          {featuresData.sectionTitle || "Features"}
        </h2>
        <p className="text-lg text-gray-600 mb-8">{featuresData.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 mx-auto">
          {featuresData.images.map((image: any, index: any) => (
            <Image
              key={index}
              src={image.image.url}
              alt={`Feature image ${index + 1}`}
              className="rounded-sm mx-auto"
              width={1000}
              height={1000}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {featuresData.featureList.map((feature: any, index: any) => (
            <div key={index} className="flex text-start">
              <SquareCheckBig
                strokeWidth={2.5}
                size={28}
                className="text-[#55bc7e] mr-3"
              />
              <p className="text-xl font-medium">{feature.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
