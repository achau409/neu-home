import Stars from "./ui/Stars";
import Testimonial from "./ui/Testimonial";
import type { Testimonial as TestimonialT } from "@/lib/types";

const REVIEWS: TestimonialT[] = [
  {
    name: "Anne C.",
    location: "New York, NY",
    text: "Above and beyond. Moved furniture, vacuumed and cleaned up before leaving.",
  },
  {
    name: "Sam P.",
    location: "Brooklyn, NY",
    text: "Allergens gone from my old carpet. First time I got a great night's sleep.",
  },
  {
    name: "Phil S.",
    location: "Queens, NY",
    text: "Pricing was better than expected. Furniture moved back, area cleaned.",
  },
];

export default function Reviews() {
  return (
    <section style={{ padding: "28px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <Stars value={5} size={18} />
        <div
          style={{
            fontSize: 13,
            color: "var(--ink-soft)",
            marginTop: 6,
          }}
        >
          <strong style={{ color: "var(--navy)" }}>4.9</strong> · 1,500+
          verified Google reviews
        </div>
      </div>
      <h2
        className="display"
        style={{
          fontSize: 22,
          margin: "0 0 16px",
          color: "var(--navy)",
          textAlign: "center",
        }}
      >
        What homeowners say
      </h2>
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          padding: "0 0 8px",
          scrollSnapType: "x mandatory",
        }}
      >
        {REVIEWS.map((t, i) => (
          <div key={i} style={{ minWidth: 260, scrollSnapAlign: "start" }}>
            <Testimonial {...t} />
          </div>
        ))}
      </div>
    </section>
  );
}
