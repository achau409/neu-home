"use client";

import { useEffect, useRef, useState } from "react";

type BeforeAfterProps = { height?: number };

export default function BeforeAfter({ height = 280 }: BeforeAfterProps) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = (clientX: number) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  useEffect(() => {
    const mm = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const x =
        "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      move(x);
    };
    const mu = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    window.addEventListener("touchmove", mm);
    window.addEventListener("touchend", mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("touchmove", mm);
      window.removeEventListener("touchend", mu);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        height,
        userSelect: "none",
        cursor: "ew-resize",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }} className="floor-ph">
        <div style={labelRight}>AFTER</div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 ${100 - pos}% 0 0)`,
          background: "#3a3328",
          backgroundImage:
            "repeating-linear-gradient(90deg, #2a2620 0, #2a2620 60px, #3a3328 60px, #3a3328 120px)",
        }}
      >
        <div style={labelLeft}>BEFORE</div>
      </div>
      <div
        onMouseDown={(e) => {
          dragging.current = true;
          e.preventDefault();
        }}
        onTouchStart={() => {
          dragging.current = true;
        }}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${pos}%`,
          width: 3,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 40,
            height: 40,
            borderRadius: 999,
            background: "var(--yellow)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            color: "var(--navy)",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          ⇆
        </div>
      </div>
    </div>
  );
}

const labelBase: React.CSSProperties = {
  position: "absolute",
  top: 12,
  padding: "4px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.95)",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--navy)",
};
const labelRight: React.CSSProperties = { ...labelBase, right: 12 };
const labelLeft: React.CSSProperties = { ...labelBase, left: 12 };
