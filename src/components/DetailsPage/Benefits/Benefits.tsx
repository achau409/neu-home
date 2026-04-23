import { SquareCheckBig } from "lucide-react";
import Image from "next/image";

type BenefitsSectionProps = {
  serviceData: any;
};

const Benefits = ({ serviceData }: BenefitsSectionProps) => {
  return (
    <section className="flex flex-col items-center justify-center w-full lg:w-[1180px] mx-auto md:my-16 my-8 px-4">

      {/* Title */}
      <h2 className="text-[1.5rem] lg:text-[2.5rem] font-bold mb-1 text-center  tracking-[-0.5px]">        {serviceData.benefits.sectionTitle}
      </h2>

      {/* Subtitle */}
      <h3 className="md:text-[1.05rem] text-[#6b7280] mb-12 text-center font-normal max-w-xl leading-relaxed">
        {serviceData.description}
      </h3>

      <div className="flex flex-col md:flex-row justify-center items-center gap-10 w-full">

        {/* Benefits List */}
        <div className="w-full md:w-1/2">
          <ul className="space-y-6">
            {serviceData.benefits.benefitsList.map(
              (benefit: any, index: any) => (
                <li
                  key={index}
                  className="flex items-start gap-3"
                >
                  <SquareCheckBig
                    strokeWidth={2}
                    size={24}
                    className="text-[#4CAF78] mt-1 min-w-[24px]"
                  />
                  <span className="leading-relaxed font-semibold md:text-[1.05rem] text-[15px] text-gray-800">
                    {benefit.title}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Image */}
        <div className="w-full md:w-1/2 h-80">
          <Image
            src={serviceData.serviceImage.url}
            alt={serviceData.title}
            width={1000}
            height={1000}
            className="w-full h-full object-cover rounded-xl shadow-sm"
            sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
            quality={90}
            loading="lazy"
          />
        </div>

      </div>
    </section>
  );
};

export default Benefits;