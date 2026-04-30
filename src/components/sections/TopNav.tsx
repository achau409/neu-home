import GoLogo from "./ui/GoLogo";

export default function TopNav() {
  return (
    <header
      style={{
        padding: "12px 16px",
        background: "var(--navy)",
        display: "flex",
        justifyContent: "space-center",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <GoLogo light />
    </header>
  );
}
