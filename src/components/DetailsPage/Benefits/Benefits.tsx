import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";

type BenefitsSectionProps = {
  serviceData: any;
};

const Benefits = ({ serviceData }: BenefitsSectionProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full lg:w-[1180px] mx-auto my-10 px-4">
      <h1 className="text-4xl font-bold mb-4 text-center">
        {serviceData.benefits.sectionTitle}
      </h1>
      <p className="text-lg text-gray-600 mb-6 text-center font-semibold">
        {serviceData.description}
      </p>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
        {/* Benefits list Section ----------------*/}
        <Card className="p-2 py-4 md:p-6 w-full md:w-1/2 min:h-80">
          <CardContent>
            <ul className="space-y-4">
              {serviceData.benefits.benefitsList.map(
                (benefit: any, index: any) => (
                  <li
                    key={index}
                    className="flex items-center space-x-3 font-bold text-lg"
                  >
                    <Check className="text-[#28a745] w-5 h-5" />
                    <span className="text-gray-800">{benefit.title}</span>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Image Section-------------------- */}
        <div className="w-full md:w-1/2 h-80">
          <Image
            src={serviceData.serviceImage.url}
            alt={serviceData.title}
            height={1000}
            width={1000}
            className="rounded-lg shadow-md w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Benefits;
