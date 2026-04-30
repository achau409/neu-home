export default function PromoBanner() {
  return (
    <div
      style={{
        background: "var(--yellow)",
        color: "var(--navy)",
        padding: "8px 16px",
        fontSize: 12,
        fontWeight: 700,
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span>🔥</span> 0% APR for 60 mo · Free moving + removal
    </div>
  );
}
