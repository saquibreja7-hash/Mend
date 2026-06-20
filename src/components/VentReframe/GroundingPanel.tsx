"use client";

import React from "react";

interface GroundingPanelProps {
  onClose: () => void;
}

const groundingSteps = [
  { num: "5", label: "See", desc: "Look around you and name <strong>5 things you can see</strong> (e.g. a plant, a shadow, a cup)." },
  { num: "4", label: "Touch", desc: "Pay attention to your body and name <strong>4 things you can feel</strong> (e.g. key texture, seat back, clothing warmth)." },
  { num: "3", label: "Hear", desc: "Listen to the environment and name <strong>3 sounds you can hear</strong> (e.g. traffic hum, air vent, distant voices)." },
  { num: "2", label: "Smell", desc: "Sniff the air and identify <strong>2 scents you can smell</strong> (e.g. soap, paper, coffee, fresh air)." },
  { num: "1", label: "Taste", desc: "Focus on your mouth and identify <strong>1 taste you can taste</strong> (e.g. mint, water, or the inside of your cheek)." }
];

export default function GroundingPanel({ onClose }: GroundingPanelProps) {
  return (
    <div className="grounding-panel" id="grounding-panel">
      <div className="grounding-header">
        <h3>5-4-3-2-1 Grounding</h3>
        <p>Anchor yourself to the present moment, right now.</p>
      </div>
      <div id="grounding-steps-container">
        {groundingSteps.map((step) => (
          <div
            key={step.num}
            className="grounding-step"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "12px",
              background: "var(--bg-input)",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1px solid var(--border)"
            }}
          >
            <div
              className="step-number"
              style={{
                background: "var(--grad-hero)",
                fontSize: "0.85rem",
                fontWeight: 700,
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                color: "#ffffff"
              }}
            >
              {step.num}
            </div>
            <div style={{ flexGrow: 1 }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  margin: "0 0 2px 0"
                }}
              >
                {step.label}
              </p>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: 1.4
                }}
                dangerouslySetInnerHTML={{ __html: step.desc }}
              ></p>
            </div>
          </div>
        ))}
      </div>
      <button className="btn-secondary" id="btn-grounding-close" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
