type Pain = { i: string; t: string; d: string };

const PAINS: Pain[] = [
  { i: "⚠", t: "Loose boards = fall risk", d: "Real safety hazard for kids, pets & older family." },
  { i: "◯", t: "Trapped dust & allergens", d: "Worn carpet holds what your vacuum misses." },
  { i: "✦", t: "Scratches & stains", d: "Buyers notice — and adjust their offer down." },
  { i: "∿", t: "Creaks & uneven boards", d: "Often a sign of warped subfloor below." },
];

export default function PainPoints() {
  return (
    <section style={{ padding: "8px 16px 28px" }}>
      <h2
        className="display"
        style={{
          fontSize: 22,
          margin: "0 0 16px",
          color: "var(--navy)",
          textAlign: "center",
        }}
      >
        What old floors quietly cost you
      </h2>
      <div style={{ display: "grid", gap: 10 }}>
        {PAINS.map((it, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: 14,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--pink)",
                color: "var(--navy)",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {it.i}
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 14, color: "var(--navy)" }}
              >
                {it.t}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  marginTop: 2,
                }}
              >
                {it.d}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
