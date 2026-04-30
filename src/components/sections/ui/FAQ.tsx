"use client";

import { useState } from "react";
import type { FAQItem } from "@/lib/types";

type FAQProps = { items: FAQItem[] };

export default function FAQ({ items }: FAQProps) {
  const [open, setOpen] = useState<number>(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it, i) => (
        <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: 16,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--navy)",
            }}
          >
            <span>{it.q}</span>
            <span
              style={{
                fontSize: 18,
                color: "var(--yellow-deep)",
                transform: open === i ? "rotate(45deg)" : "rotate(0)",
                transition: "transform 0.18s",
              }}
            >
              +
            </span>
          </button>
          {open === i && (
            <div
              style={{
                padding: "0 16px 16px",
                color: "var(--ink-soft)",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              {it.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
