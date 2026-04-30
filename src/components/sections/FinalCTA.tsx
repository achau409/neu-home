"use client";

export default function FinalCTA() {
  return (
    <section
      style={{
        padding: "32px 16px",
        background: "var(--yellow)",
        textAlign: "center",
      }}
    >
      <h2
        className="display"
        style={{ fontSize: 26, margin: 0, color: "var(--navy)" }}
      >
        Your new floor is one ZIP away.
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--navy)",
          margin: "10px 0 18px",
          opacity: 0.85,
        }}
      >
        Free · No obligation · Reply in 24 hrs
      </p>
      <button
        className="btn btn-navy btn-lg btn-block"
        onClick={() => window.scrollTo({ top: 280, behavior: "smooth" })}
      >
        Start my free quote →
      </button>
    </section>
  );
}
