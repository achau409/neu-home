import React from 'react';

interface TextBlockProps {
  id: string;
  text: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontWeight?: number;
  blockName?: string | null;
  backgroundColor?: string | null;
}

const TextBlock: React.FC<TextBlockProps> = ({
  id,
  text,
  textAlign = 'left',
  fontSize = 16,
  fontWeight = 400,
  blockName,
  backgroundColor,
}) => {
  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign];

  const fontSizeStyle = {
    fontSize: `${fontSize}px`,
    fontWeight: fontWeight,
  };

  return (
    <section
      id={blockName || `block-${id}`}
      className="my-8"
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      {blockName && <h3 className="text-xl font-semibold mb-4">{blockName}</h3>}
      <div className={`${textAlignClass}`}>
        <p style={fontSizeStyle}>{text}</p>
      </div>
    </section>
  );
};

export default TextBlock; 