import GoLogo from "./ui/GoLogo";

export default function Footer() {
  return (
    <footer
      style={{
        padding: "24px 16px",
        background: "var(--navy-deep)",
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <GoLogo light />
      </div>
      <div style={{ marginTop: 12 }}>
        ©2026 NEU Home Services · Terms · Privacy
      </div>
    </footer>
  );
}
