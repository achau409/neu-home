"use client";

import { useEffect, useRef } from "react";
import parse, { domToReact, Element, HTMLReactParserOptions } from "html-react-parser";

const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof Element) {
      // Skip script/noscript from the React render tree — scripts are executed
      // separately via document.createElement in useEffect below
      if (domNode.name === "script" || domNode.name === "noscript") {
        return <></>;
      }
      if (domNode.name === "h1") {
        return <h2>{domToReact(domNode.children as never[], parserOptions)}</h2>;
      }
    }
    return undefined;
  },
};

const HTMLBlock = ({ content }: { content: string }) => {
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current || !content) return;
    injectedRef.current = true;

    const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(content)) !== null) {
      const attrs = match[1];
      const scriptContent = match[2].trim();
      const script = document.createElement("script");

      const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        script.src = srcMatch[1];
        script.async = true;
      }
      if (scriptContent) {
        script.textContent = scriptContent;
      }

      document.head.appendChild(script);
    }
  }, [content]);

  if (!content) return null;

  return <div>{parse(content, parserOptions)}</div>;
};

export default HTMLBlock;
