import { SquareCheckBig } from "lucide-react";
import Image from "next/image";

type BenefitsSectionProps = {
  serviceData: any;
};

const Benefits = ({ serviceData }: BenefitsSectionProps) => {
  return (
    <section className="flex flex-col items-center justify-center w-full lg:w-[1180px] mx-auto my-10 px-4">
      <h2 className="text-[1.5rem] lg:text-[2.5rem] font-bold mb-1 text-center text-[#152C61] max-w-4xl tracking-[-0.5px]">
        {serviceData.benefits.sectionTitle}
      </h2>
      <h3 className="md:text-lg text-[#6b7280] mb-10 text-center font-semibold tracking-tighter  max-w-xl">
        {serviceData.description}
      </h3>

      <div className="flex flex-col md:flex-row justify-center items-center gap-6 w-full">
        <div className="p-2 py-4 md:p-6 md:h-80 ">
          <div>
            <ul className="space-y-4">
              {serviceData.benefits.benefitsList.map(
                (benefit: any, index: any) => (
                  <li
                    key={index}
                    className="flex items-center space-x-3"
                  >
                    <SquareCheckBig
                      strokeWidth={2.5}
                      size={28}
                      className="text-[#55bc7e] md:mr-2 md:!min-w-[28px] !min-w-[28px]  "
                    />
                    <span className="tracking-tighter  leading-tight font-semibold md:text-lg text-[15px]">{benefit.title}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="w-full md:w-1/2 h-80">
          <Image
            src={serviceData.serviceImage.url}
            alt={serviceData.title}
            width={1000}
            height={1000}
            className="w-full h-full object-cover rounded-md "
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
