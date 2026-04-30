type GoLogoProps = { light?: boolean };

export default function GoLogo({ light = false }: GoLogoProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: light ? "var(--yellow)" : "var(--navy)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          style={{
            color: light ? "var(--navy)" : "var(--yellow)",
            fontWeight: 800,
            fontSize: 16,
            fontFamily: "var(--font-display)",
          }}
        >
          g
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 16,
            color: light ? "#fff" : "var(--navy)",
          }}
        >
          Go Flooring
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: light ? "rgba(255,255,255,0.7)" : "var(--ink-mute)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          by NEU Home
        </span>
      </div>
    </div>
  );
}
