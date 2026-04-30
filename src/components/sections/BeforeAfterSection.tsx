import BeforeAfter from "./ui/BeforeAfter";

export default function BeforeAfterSection() {
  return (
    <section style={{ padding: "28px 16px" }}>
      <h2
        className="display"
        style={{
          fontSize: 22,
          margin: "0 0 6px",
          color: "var(--navy)",
          textAlign: "center",
        }}
      >
        See the difference
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "var(--ink-soft)",
          margin: "0 0 16px",
        }}
      >
        Drag the slider →
      </p>
      <BeforeAfter height={260} />
    </section>
  );
}
