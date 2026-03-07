import Link from "next/link";
import Image from "next/image";
import { Service } from "@/types/service";
// Fake Data---------------

const Projects = ({ services }: { services: Service[] }) => {
  return (
    <section className="mt-10 mb-20">
      <div className="max-w-[1180px] mx-auto text-center px-4 sm:px-6 lg:px-0">
        <h1 className="text-3xl font-semibold text-gray-800 mt-2">
          Home Improvement Projects We Can Help With
        </h1>

        <div className="grid gap-8 md:gap-16 grid-cols-2 lg:grid-cols-5 mt-16">
          {services.map((service) => (
            <Link href={`/${service.slug}`} key={service.slug}>
              <div className="group  p-2 flex flex-col items-center ">
                {service.serviceIcon && (
                  <div className="rounded-lg p-4  px-4 shadow-xl">

                    <Image
                      src={service.serviceIcon.url}
                      alt={service.title}
                      width={1000}
                      height={1000}
                      className="w-60"
                    />
                  </div>

                )}
                <h2 className="font-bold text-black group-hover:text-gray-600 mt-3">
                  {service.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
