import React from "react";
import ManyImagesBlock from "../blocks/ManyImagesBlock";
import ImageBlock from "../blocks/ImageBlock";
import TextImageBlock from "../blocks/TextImageBlock";
import TextBlock from "../blocks/TextBlock";
import CardBlock from "../blocks/CardBlock";
import DotLoading from "./Dotloading";
import HTMLBlock from "../blocks/HTMLBlock";
import BeforeAfterBlock from "../blocks/BeforeAfter";
import CityBlock from "../blocks/CityBlock";

interface Image {
  // Define your image properties here
  url?: string;
  alt?: string;
  // Add other properties as needed
}

interface ContentBlock {
  id: string;
  blockName: string | null;
  blockType: string;
  [key: string]: any; // For other properties specific to block types
}

interface ProjectContentProps {
  content: ContentBlock[];
  isLoading?: boolean;
}

const ProjectContent: React.FC<ProjectContentProps> = ({
  content,
  isLoading = false,
}) => {
  if (isLoading) {
    return <DotLoading />;
  }

  // Filter out manyImages blocks that have isTopPosition = true
  const filteredContent = content.filter((block) => {
    if (block.blockType === "manyImages" && block.isTopPosition === true) {
      return false;
    }
    return true;
  });

  return (
    <div className="project-content">
      {filteredContent.map((block) => {
        switch (block.blockType) {
          case "manyImages":
            return (
              <ManyImagesBlock
                key={block.id}
                {...block}
                images={block.images}
              />
            );
          case "image":
            return <ImageBlock key={block.id} {...block} image={block.image} />;
          case "textImage":
            return (
              <TextImageBlock key={block.id} {...block} image={block.image} />
            );
          case "text":
            return <TextBlock key={block.id} {...block} text={block.text} />;
          case "htmlblock":
            return <HTMLBlock key={block.id} {...block} content={block.html} />;
          case "beforeAfter":
            return (
              <BeforeAfterBlock
                key={block.id}
                {...block}
                headerTitle={block.headerTitle}
                headerDescription={block.headerDescription}
                beforeImage={block.beforeImage}
                afterImage={block.afterImage}
              />
            );
          case "card":
            return (
              <CardBlock
                key={block.id}
                {...block}
                title={block.title}
                sections={block.sections}
              />
            );
          case "cities":
            return (
              <CityBlock
                key={block.id}
                sectionTitle={block.sectionTitle}
                cities={block.cities}
                backgroundColor={block.backgroundColor}
                blockName={block.blockName}
              />
            );
        }
      })}
    </div>
  );
};

export default ProjectContent;
