import React from "react";
import parse, { domToReact, Element, HTMLReactParserOptions } from "html-react-parser";

const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof Element && domNode.name === "h1") {
      return <h2>{domToReact(domNode.children as never[], parserOptions)}</h2>;
    }

    return undefined;
  },
};

const HTMLBlock = ({ content }: { content: string }) => {
  return (
    <div className="container mx-auto">
      <div className="prose max-w-none">
        {content ? parse(content, parserOptions) : <p>Loading...</p>}
      </div>
    </div>
  );
};

export default HTMLBlock;
