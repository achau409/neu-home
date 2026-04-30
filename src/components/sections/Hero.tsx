import Stars from "./ui/Stars";

export default function Hero() {
  return (
    <section
      style={{
        padding: "24px 16px 20px",
        background: "var(--navy)",
        color: "#fff",
      }}
    >
      <div className="pill pill-yellow" style={{ marginBottom: 12 }}>
        ★ Free quote · No obligation
      </div>
      <h1
        className="display"
        style={{ fontSize: 32, margin: 0, color: "#fff", lineHeight: 1.05 }}
      >
        Your new floor,
        <br />
        <span style={{ color: "var(--yellow)" }}>installed in days.</span>
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.85)",
          margin: "12px 0 16px",
        }}
      >
        Free in-home quote. 0% APR. Lifetime install warranty. Top-rated local
        pros — backed by 20+ years.
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <Stars value={5} size={14} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>4.9</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
          · 1,500+ reviews · BBB A+
        </span>
      </div>
    </section>
  );
}
