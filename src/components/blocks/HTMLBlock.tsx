import React from "react";
import parse from "html-react-parser";

const HTMLBlock = ({ content }: { content: string }) => {
  return (
    <div className="container mx-auto">
      <div className="prose max-w-none">
        {content ? parse(content) : <p>Loading...</p>}
      </div>
    </div>
  );
};

export default HTMLBlock;
