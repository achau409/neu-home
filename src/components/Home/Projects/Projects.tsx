import { Service } from "@/types/service";
import ProjectsClient from "@/components/Home/Projects/ProjectsClient";

type ProjectListItem = {
  title: string;
  slug: string;
  category?:  "interior" | "exterior" | null;
  popular?: boolean;
  serviceIconUrl?: string;
};

const Projects = ({ services }: { services: Service[] }) => {
  const projectItems: ProjectListItem[] = (services ?? []).map((service: Service) => ({
    title: service.title,
    slug: service.slug,
    category: service.category,
    popular: service.popular,
    serviceIconUrl: service.serviceIcon?.url,
  }));

  return <ProjectsClient services={projectItems} />;
};

export default Projects;
