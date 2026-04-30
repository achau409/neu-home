import type { WizardData } from "@/lib/types";

type SuccessCardProps = { data: WizardData };

export default function SuccessCard({ data }: SuccessCardProps) {
  const firstName = data.name ? data.name.split(" ")[0] : "";
  return (
    <div
      className="card check-anim"
      style={{
        padding: 24,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: "var(--green-soft)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span style={{ fontSize: 28, color: "var(--green)" }}>✓</span>
      </div>
      <h3 className="display" style={{ fontSize: 22, margin: 0, color: "var(--navy)" }}>
        You're all set{firstName ? `, ${firstName}` : ""}!
      </h3>
      <p
        style={{
          margin: 0,
          color: "var(--ink-soft)",
          fontSize: 14,
          maxWidth: 320,
        }}
      >
        A local Go Flooring specialist will reach out within 24 hours with your
        custom quote{data.zip ? ` for ZIP ${data.zip}` : ""}.
      </p>
      <div className="pill pill-yellow">0% APR offer reserved · 48 hrs</div>
    </div>
  );
}
