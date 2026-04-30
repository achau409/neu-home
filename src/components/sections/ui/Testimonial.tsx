import Stars from "./Stars";
import type { Testimonial as TestimonialT } from "@/lib/types";

export default function Testimonial({ name, location, text }: TestimonialT) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      className="card"
      style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}
    >
      <Stars value={5} size={13} />
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>"{text}"</p>
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}
      >
        <div className="avatar">{initials}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{name}</div>
          <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>
            {location} · Verified
          </div>
        </div>
      </div>
    </div>
  );
}
