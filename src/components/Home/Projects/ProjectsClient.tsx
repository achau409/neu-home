"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ProjectListItem = {
  title: string;
  slug: string;
  category?: "interior" | "exterior" | null;
  popular?: boolean;
  serviceIconUrl?: string;
};

const CATEGORY_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Interior", value: "interior" },
  { label: "Exterior", value: "exterior" },
  { label: "All Services", value: "all" }

] as const;

type CategoryFilter = (typeof CATEGORY_OPTIONS)[number]["value"];

const ProjectsClient = ({ services }: { services: ProjectListItem[] }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("popular");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleServices, setVisibleServices] = useState<ProjectListItem[]>(() =>
    services.filter((service) => Boolean(service.popular)),
  );

  const filteredServices = useMemo(() => {
    if (activeCategory === "popular") {
      return services.filter((service) => Boolean(service.popular));
    }

    if (activeCategory === "all") {
      return services;
    }

    return services.filter((service) => service.category === activeCategory);
  }, [activeCategory, services]);

  useEffect(() => {
    setIsTransitioning(true);

    const timeout = setTimeout(() => {
      setVisibleServices(filteredServices);
      requestAnimationFrame(() => setIsTransitioning(false));
    }, 120);

    return () => clearTimeout(timeout);
  }, [filteredServices]);

  return (
    <section className="mt-10 md:mb-10">
      <div className="max-w-[1020px] mx-auto text-center px-4 sm:px-6 lg:px-0">

        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mt-6">
          Home Improvement Projects We Can Help With
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CATEGORY_OPTIONS.map((option) => {
            const isActive = option.value === activeCategory;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setActiveCategory(option.value)}
                className={`rounded-full border md:px-4 p-2 text-xs md:text-sm font-semibold  shadow-sm transition-all duration-300 ${isActive
                  ? "border-trust-accent bg-trust-accent text-white shadow-sm scale-[1.02]"
                  : "border-gray-300 bg-white text-gray-700 hover:border-trust-accent hover:text-trust-accent"
                  }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div
          className={`transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
        >
          <ul className="grid gap-0 md:gap-2 grid-cols-3 lg:grid-cols-3 mt-10">
            {visibleServices.map((service) => (
              <li key={service.slug}>
                <Link href={`/${service.slug}`} className="group p-0 flex flex-col items-center">
                  {service.serviceIconUrl && (
                    <div className="flex items-center justify-center flex-col gap-1 ">
                      <Image
                        src={service.serviceIconUrl}
                        alt={service.title}
                        width={1000}
                        height={1000}
                        sizes="(min-width: 1024px) 240px, (min-width: 768px) 25vw, 50vw "
                        quality={75}
                        loading="lazy"
                        className="md:w-28 md:h-28 w-16 h-16 object-contain hover:scale-110 transition-all duration-300"
                      />
                      <h3 className="font-bold text-black group-hover:text-gray-600 mb-8 text-xs md:text-base mt-2 ">
                        {service.title}
                      </h3>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {visibleServices.length === 0 && (
          <p className="mt-10 text-sm text-gray-500">No services found for this category.</p>
        )}
      </div>
    </section>
  );
};

export default ProjectsClient;
