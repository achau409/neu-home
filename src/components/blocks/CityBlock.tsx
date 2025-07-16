import React from "react";
import { ChevronRight } from "lucide-react";

interface City {
  id: string;
  city: string;
}

interface CityBlockProps {
  sectionTitle: string;
  cities: City[];
  backgroundColor?: string | null;
  blockName?: string | null;
}

const CityBlock: React.FC<CityBlockProps> = ({
  sectionTitle,
  cities,
  backgroundColor,
  blockName,
}) => {
  return (
    <section
      id={blockName || undefined}
      className="py-12"
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">{sectionTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 md:gap-x-8 justify-center items-center content-center">
          {cities.map((city) => (
            <div key={city.id} className="flex items-center space-x-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-black">
                <ChevronRight className="w-5 h-5" />
              </span>
              <span className="text-lg font-medium">{city.city}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CityBlock;
