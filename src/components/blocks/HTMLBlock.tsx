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
    <section className="flex flex-col items-center justify-center w-full lg:w-[1180px] mx-auto md:my-16 my-8 px-4">
      <div className="prose max-w-none">
        {content ? parse(content, parserOptions) : <p>Loading...</p>}
      </div>
    </section>
  );
};

export default HTMLBlock;
