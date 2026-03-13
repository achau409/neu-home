import Link from "next/link";
import Image from "next/image";
import { Service } from "@/types/service";
// Fake Data---------------

const Projects = ({ services }: { services: Service[] }) => {
  return (
    <section className="mt-10 mb-20">
      <div className="max-w-[1180px] mx-auto text-center px-4 sm:px-6 lg:px-0">
        <h2 className="text-3xl font-semibold text-gray-800 mt-2">
          Home Improvement Projects We Can Help With
        </h2>

        <ul className="grid gap-8 md:gap-16 grid-cols-2 lg:grid-cols-5 mt-16">
          {services.map((service) => (
            <li key={service.slug}>
              <Link href={`/${service.slug}`} className="group p-2 flex flex-col items-center">
                {service.serviceIcon && (
                  <div className="rounded-lg p-4 px-4 shadow-xl">
                    <Image
                      src={service.serviceIcon.url}
                      alt={service.title}
                      width={1000}
                      height={1000}
                      className="w-60"
                    />
                  </div>

                )}
                <h3 className="font-bold text-black group-hover:text-gray-600 mt-3">
                  {service.title}
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Projects;
