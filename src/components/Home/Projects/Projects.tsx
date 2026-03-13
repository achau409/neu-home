import { Service } from "@/types/service";
import ProjectsClient from "@/components/Home/Projects/ProjectsClient";

type ProjectListItem = {
  title: string;
  slug: string;
  category?: "popular" | "interior" | "exterior" | null;
  serviceIconUrl?: string;
};

const Projects = ({ services }: { services: Service[] }) => {
  const projectItems: ProjectListItem[] = (services ?? []).map((service) => ({
    title: service.title,
    slug: service.slug,
    category: service.category,
    serviceIconUrl: service.serviceIcon?.url,
  }));

  return <ProjectsClient services={projectItems} />;
};

export default Projects;
