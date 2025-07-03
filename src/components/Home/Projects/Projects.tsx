import Link from "next/link";
import Image from "next/image";
import { Service } from "@/types/service";
// Fake Data---------------

const Projects = ({ services }: { services: Service[] }) => {
  return (
    <section className="mt-10 mb-20">
      <div className="max-w-[1180px] mx-auto text-center px-4 sm:px-6 lg:px-0">
        <h1 className="text-3xl font-semibold text-gray-800">
          Home Improvement Projects We Can Help With
        </h1>

        <div className="grid gap-8 md:gap-24 grid-cols-2 lg:grid-cols-4 mt-16">
          {services.map((service) => (
            <Link href={`/${service.slug}`} key={service.slug}>
              <div className="group  p-2 flex flex-col items-center border border-gray-200 rounded-lg    transform transition duration-300 cursor-pointer">
                {service.serviceIcon && (
                  <Image
                    src={service.serviceIcon.url}
                    alt={service.title}
                    width={100}
                    height={100}
                  className="mb-4 mt-6 w-50 h-20"
                />
                )}
                <h3 className="font-medium text-gray-800 group-hover:text-gray-600">
                  {service.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
