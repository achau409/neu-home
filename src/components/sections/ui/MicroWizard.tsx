"use client";

import { useState } from "react";
import { STEPS } from "@/lib/wizard-data";
import type { WizardData } from "@/lib/types";
import SuccessCard from "./SuccessCard";

const TOTAL = 5;

const initial: WizardData = {
  floor: null,
  room: null,
  size: null,
  timing: null,
  zip: "",
  name: "",
  phone: "",
};

export default function MicroWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(initial);
  const [submitted, setSubmitted] = useState<WizardData | null>(null);

  if (submitted) return <SuccessCard data={submitted} />;

  const set = <K extends keyof WizardData>(k: K, v: WizardData[K]) =>
    setData((d) => ({ ...d, [k]: v }));
  const next = () => setStep((s) => Math.min(TOTAL - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  if (step < 4) {
    const s = STEPS[step];
    return (
      <div className="card z-[99] relative" style={cardStyle}>
        <div>
          <div style={headerRow}>
            <span className="pill pill-cream">
              Step {step + 1} of {TOTAL}
            </span>
            <span style={muteSmall}>~30 sec · 100% free</span>
          </div>
          <div className="wiz-progress">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                className={`wiz-step ${i <= step ? "active" : ""}`}
              />
            ))}
          </div>
        </div>
        <div>
          <h3
            className="display"
            style={{ fontSize: 22, margin: 0, marginBottom: 4, color: "var(--navy)" }}
          >
            {s.q}
          </h3>
          <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 13 }}>
            Pick the closest match.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {s.opts.map((o) => (
            <button
              key={o.id}
              className={`wiz-option ${data[s.key] === o.id ? "selected" : ""}`}
              onClick={() => {
                set(s.key, o.id);
                setTimeout(next, 200);
              }}
            >
              <span className="wiz-option-icon">{o.icon}</span>
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <span style={{ fontWeight: 700, lineHeight: 1.2, fontSize: 13 }}>
                  {o.label}
                </span>
                {o.sub && (
                  <span style={{ fontSize: 11, color: "var(--ink-mute)", fontWeight: 400 }}>
                    {o.sub}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={back}
            disabled={step === 0}
            style={{
              opacity: step === 0 ? 0.4 : 1,
              padding: "8px 14px",
              fontSize: 13,
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Step 5 — contact info
  return (
    <div className="card" style={cardStyle}>
      <div>
        <div style={headerRow}>
          <span className="pill pill-green">✓ Almost done</span>
          <span style={muteSmall}>Step 5 of 5</span>
        </div>
        <div className="wiz-progress">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className="wiz-step active" />
          ))}
        </div>
      </div>
      <div>
        <h3
          className="display"
          style={{ fontSize: 22, margin: 0, marginBottom: 4, color: "var(--navy)" }}
        >
          Where should we send your quote?
        </h3>
        <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 13 }}>
          A local specialist will call within 24 hours.
        </p>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <input
          className="input"
          placeholder="Full name"
          value={data.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <input
          className="input"
          placeholder="Phone number"
          value={data.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <input
          className="input"
          inputMode="numeric"
          maxLength={5}
          placeholder="ZIP code"
          value={data.zip}
          onChange={(e) =>
            set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))
          }
        />
      </div>
      <button
        className="btn btn-yellow btn-lg btn-block"
        onClick={() => {
          // TODO: POST to your lead API here
          console.log("[Go Flooring lead]", data);
          setSubmitted(data);
        }}
      >
        Get my free quote →
      </button>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          fontSize: 11,
          color: "var(--ink-mute)",
        }}
      >
        <span>🔒 SSL secured</span>
        <span>·</span>
        <span>No spam</span>
        <span>·</span>
        <span>0% APR avail</span>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};
const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};
const muteSmall: React.CSSProperties = {
  fontSize: 11,
  color: "var(--ink-mute)",
  fontWeight: 600,
};
