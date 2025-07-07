import React from "react";
import { ContentBlock } from "@/types/page";
import Image from "next/image";

interface ContentBlockProps {
  block: ContentBlock;
}

const RenderNode: React.FC<{ node: any; listType?: string }> = ({
  node,
  listType,
}) => {
  if (node.type === "linebreak") {
    return <br />;
  }

  if (node.type === "text") {
    const textNode = node as any;

    const isBold = !!(textNode.format & 1); // Bold is the first bit
    const isItalic = !!(textNode.format & 2); // Italic is the second bit

    let content: React.ReactNode = textNode.text;
    if (isBold) {
      content = <strong>{content}</strong>;
    }
    if (isItalic) {
      content = <em>{content}</em>;
    }
    return <>{content}</>;
  }

  // Handle content nodes
  const contentNode = node as any;

  // Handle "block" type

  const children = contentNode.children?.map((child: any, index: number) => (
    <RenderNode key={index} node={child} listType={listType} />
  ));

  // Map content types to HTML elements

  switch (contentNode.type) {
    case "heading":
      switch (contentNode.tag) {
        case "h1":
          return <h1>{children}</h1>;
        case "h2":
          return <h2>{children}</h2>;
        case "h3":
          return <h3>{children}</h3>;
        case "h4":
          return <h4>{children}</h4>;
        case "h5":
          return <h5>{children}</h5>;
        case "h6":
          return <h6>{children}</h6>;
        default:
          return <div>{children}</div>;
      }
    case "paragraph":
      return <p>{children}</p>;
    case "list":
      const listNodeType = contentNode.listType;
      return listNodeType === "number" ? (
        <ol className="list-decimal pl-6 my-8">
          {contentNode.children?.map((child: any, index: number) => (
            <RenderNode key={index} node={child} listType={listNodeType} />
          ))}
        </ol>
      ) : listNodeType === "bullet" ? (
        <ul className="list-disc pl-6 mt-4 mb-8">
          {contentNode.children?.map((child: any, index: number) => (
            <RenderNode key={index} node={child} listType={listNodeType} />
          ))}
        </ul>
      ) : listNodeType === "check" ? (
        <ul className="my-8 list-none">
          {contentNode.children?.map((child: any, index: number) => (
            <RenderNode key={index} node={child} listType={listNodeType} />
          ))}
        </ul>
      ) : null;

    case "listitem":
      return listType === "check" ? (
        <li className="mb-2 flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={contentNode.checked || false}
            readOnly
          />
          {contentNode.children?.map((child: any, index: number) => (
            <RenderNode key={index} node={child} />
          ))}
        </li>
      ) : (
        <li className="mb-2">
          {contentNode.children?.map((child: any, index: number) => (
            <RenderNode key={index} node={child} />
          ))}
        </li>
      );
    case "link":
      const linkNode = contentNode as any;
      const { url, newTab, linkType, doc } = linkNode.fields;

      // Determine the href based on the linkType
      const href =
        linkType === "custom"
          ? url
          : linkType === "internal" && doc?.value?.slug
          ? `/${doc.value.slug}` // Assuming internal links use the slug for their URL
          : "#"; // Fallback for undefined links
      return (
        <a
          href={href}
          target={newTab ? "_blank" : "_self"}
          rel={newTab ? "noopener noreferrer" : undefined}
          className="underline"
        >
          {children}
        </a>
      );

    case "upload":
      const uploadNode = contentNode as any;
      return (
        <Image
          src={uploadNode.value?.url || ""}
          alt={uploadNode.value?.alt || "Image"}
          width={uploadNode.value?.width}
          height={uploadNode.value?.height}
          quality={90}
          className="rounded-lg mb-4"
        />
      );

    case "horizontalrule":
      return <hr className="my-8" />;

    case "quote":
      return <blockquote className="blockquote">{children}</blockquote>;

    case "relationship":
      const { value, relationTo } = contentNode;

      if (!value) {
        return (
          <div className="relationship">No relationship data available</div>
        );
      }

      // Utility functions for fallback logic
      const getImage = () =>
        value.cardImage?.url || value.meta?.image?.url || "";
      const getAltText = () =>
        value.cardImage?.alt || value.meta?.image?.alt || "Image";
      const getExcerpt = () =>
        value.cardExcerpt || value.meta?.description || "";

      switch (relationTo) {
        case "pages":
          return (
            <div className="relationship-card page">
              {getImage() && (
                <img
                  src={getImage()}
                  alt={getAltText()}
                  className="card-image"
                />
              )}
              <div className="card-content">
                <h3 className="card-title">
                  {value.pageTitle || "Untitled Page"}
                </h3>
                <p className="card-excerpt">{getExcerpt()}</p>
                <a
                  href={`/${value.slug || "#"}`}
                  className="bg8-btn bg8-btn-primary"
                  target="_self"
                >
                  Learn More
                </a>
              </div>
            </div>
          );

        case "news":
          return (
            <div className="relationship-card news">
              {getImage() && (
                <img
                  src={getImage()}
                  alt={getAltText()}
                  className="card-image"
                />
              )}
              <div className="card-content">
                <h3 className="card-title">
                  {value.newsTitle || "Untitled News"}
                </h3>
                <p className="card-excerpt">{getExcerpt()}</p>
                <a
                  href={`/${value.slug || "#"}`}
                  className="bg8-btn bg8-btn-primary"
                  target="_self"
                >
                  Read More
                </a>
              </div>
            </div>
          );

        case "products":
          return (
            <div className="relationship-card products">
              {getImage() && (
                <img
                  src={getImage()}
                  alt={getAltText()}
                  className="card-image"
                />
              )}
              <div className="card-content">
                <h3 className="card-title">
                  {value.productName || "Untitled Product"}
                </h3>
                <p className="card-excerpt">{getExcerpt()}</p>
                <a
                  href={`/${value.slug || "#"}`}
                  className="bg8-btn bg8-btn-primary"
                  target="_self"
                >
                  View Product
                </a>
              </div>
            </div>
          );

        default:
          return (
            <div className="relationship-card">
              <p>Unsupported relationship type: {relationTo}</p>
            </div>
          );
      }

    default:
      return <>{children}</>;
  }
};

const TextBlock: React.FC<ContentBlockProps> = ({ block }) => {
  const { testimonial } = block;

  if (!testimonial?.root) return null;

  const rootContent = testimonial.root as any;

  return (
    <div className={`content-block bg8-lexical mb-4`}>
      {rootContent.children.map((node: any, index: number) => (
        <RenderNode key={index} node={node} />
      ))}
    </div>
  );
};

export default TextBlock;
