const ITEMS: string[] = [
  "Lifetime install warranty",
  "Free furniture moving + old-floor removal",
  "Waterproof, pet-friendly options",
  "Often installed next-day",
  "0% APR · 60 months",
];

export default function Included() {
  return (
    <section
      style={{
        padding: "24px 16px",
        background: "var(--navy)",
        color: "#fff",
      }}
    >
      <div className="pill pill-yellow" style={{ marginBottom: 10 }}>
        Included
      </div>
      <h2 className="display" style={{ fontSize: 24, margin: 0, color: "#fff" }}>
        Everything you need.
        <br />
        Nothing you don't.
      </h2>
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {ITEMS.map((t, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 99,
                background: "var(--yellow)",
                color: "var(--navy)",
                display: "grid",
                placeItems: "center",
                fontSize: 13,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <span style={{ fontSize: 14 }}>{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
