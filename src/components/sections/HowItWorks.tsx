type Step = { n: string; t: string; d: string };

const STEPS: Step[] = [
  { n: "01", t: "Tell us about your project", d: "30-second planner" },
  { n: "02", t: "Match with a local pro", d: "Vetted · licensed · insured" },
  { n: "03", t: "Free in-home quote", d: "Real numbers · 0% APR options" },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: "24px 16px", background: "var(--pink-soft)" }}>
      <h2
        className="display"
        style={{
          fontSize: 22,
          margin: "0 0 16px",
          color: "var(--navy)",
          textAlign: "center",
        }}
      >
        How it works
      </h2>
      <div style={{ display: "grid", gap: 10 }}>
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="card"
            style={{
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "var(--yellow)",
                color: "var(--navy)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {s.n}
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 15, color: "var(--navy)" }}
              >
                {s.t}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                {s.d}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
