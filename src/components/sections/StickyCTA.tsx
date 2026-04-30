"use client";

export default function StickyCTA() {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 12,
        padding: "0 12px",
        zIndex: 30,
        marginTop: -64,
      }}
    >
      <div
        style={{
          background: "var(--navy)",
          color: "#fff",
          borderRadius: 14,
          padding: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <span
          className="pulse-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: 99,
            background: "var(--yellow)",
            flexShrink: 0,
            marginLeft: 6,
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>
          0% APR · Free quote in 30s
        </span>
        <button
          className="btn btn-yellow"
          style={{ padding: "8px 14px", fontSize: 12 }}
          onClick={() => window.scrollTo({ top: 280, behavior: "smooth" })}
        >
          Get quote
        </button>
      </div>
    </div>
  );
}
