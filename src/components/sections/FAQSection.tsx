import FAQ from "./ui/FAQ";
import type { FAQItem } from "@/lib/types";

const FAQS: FAQItem[] = [
  {
    q: "How much does it cost?",
    a: "Most projects land between $3–$14/sq ft installed. Your free quote gives you a firm number.",
  },
  {
    q: "How long does install take?",
    a: "A single room is usually one day. Whole home, 3–5 days.",
  },
  {
    q: "Do you move furniture?",
    a: "Yes — free furniture moving and old-floor removal on every install.",
  },
  {
    q: "Is there a warranty?",
    a: "Lifetime install warranty plus full manufacturer coverage.",
  },
  {
    q: "Do you offer financing?",
    a: "0% APR for 60 months for qualified buyers — pre-qualify in minutes.",
  },
];

export default function FAQSection() {
  return (
    <section style={{ padding: "28px 16px", background: "var(--cream-warm)" }}>
      <h2
        className="display"
        style={{
          fontSize: 22,
          margin: "0 0 16px",
          color: "var(--navy)",
          textAlign: "center",
        }}
      >
        Common questions
      </h2>
      <FAQ items={FAQS} />
    </section>
  );
}
