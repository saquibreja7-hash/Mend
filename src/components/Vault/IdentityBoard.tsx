"use client";

import React, { useState, useEffect } from "react";
import { IdentityData } from "@/types";

interface IdentityBoardProps {
  identity: IdentityData;
  onAddValue: (val: string) => void;
  onRemoveValue: (val: string) => void;
  onAddReclaim: (item: string) => void;
  onRemoveReclaim: (index: number) => void;
  onSaveBecoming: (becoming: string) => void;
}

const valuesPresetList = [
  "Authenticity",
  "Freedom",
  "Growth",
  "Family",
  "Creativity",
  "Adventure",
  "Kindness",
  "Integrity",
  "Humor",
  "Peace",
  "Ambition",
  "Connection",
];

export default function IdentityBoard({
  identity,
  onAddValue,
  onRemoveValue,
  onAddReclaim,
  onRemoveReclaim,
  onSaveBecoming,
}: IdentityBoardProps) {
  const [customValue, setCustomValue] = useState("");
  const [reclaimInput, setReclaimInput] = useState("");
  const [becomingText, setBecomingText] = useState(identity.becoming || "");
  const [becomingSaved, setBecomingSaved] = useState(false);

  useEffect(() => {
    setBecomingText(identity.becoming || "");
  }, [identity.becoming]);

  const handleAddValue = () => {
    const trimmed = customValue.trim();
    if (trimmed && !identity.values.includes(trimmed)) {
      onAddValue(trimmed);
      setCustomValue("");
    }
  };

  const handleAddReclaim = () => {
    const trimmed = reclaimInput.trim();
    if (trimmed) {
      onAddReclaim(trimmed);
      setReclaimInput("");
    }
  };

  const handleSaveBecoming = () => {
    onSaveBecoming(becomingText);
    setBecomingSaved(true);
    setTimeout(() => {
      setBecomingSaved(false);
    }, 2000);
  };

  return (
    <div id="identity-board-wrap" className="future-content-wrap">
      <div className="section-header" style={{ marginBottom: "16px" }}>
        <h2>Who Am I Now?</h2>
        <p>Rebuild your self-concept. Self-concept clarity is the #1 predictor of recovery speed.</p>
      </div>

      {/* Values */}
      <div className="identity-section-card">
        <h3>🧭 My Core Values</h3>
        <p>What matters most to you, independent of any relationship?</p>
        <div className="values-chips-wrap" id="values-chips">
          {identity.values.map((val) => (
            <div key={val} className="value-chip">
              <span>{val}</span>
              <button className="value-chip-delete" onClick={() => onRemoveValue(val)}>
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="values-preset-wrap" id="values-presets">
          {valuesPresetList.map((preset) => {
            const isSelected = identity.values.includes(preset);
            return (
              <button
                key={preset}
                className={`value-preset-tag ${isSelected ? "selected" : ""}`}
                disabled={isSelected}
                onClick={() => onAddValue(preset)}
              >
                {preset}
              </button>
            );
          })}
        </div>
        <div className="identity-input-group">
          <input
            type="text"
            id="custom-value-input"
            placeholder="Add a custom value..."
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddValue()}
          />
          <button className="btn-add" id="btn-add-value" onClick={handleAddValue}>
            +
          </button>
        </div>
      </div>

      {/* Reclaim List */}
      <div className="identity-section-card">
        <h3>🎯 Things I Want to Reclaim</h3>
        <p>Hobbies, habits, or parts of yourself you put aside during the relationship.</p>
        <ul id="reclaim-list" className="reclaim-list">
          {identity.reclaim.length === 0 ? (
            <li className="empty-state" style={{ padding: "10px", width: "100%", fontSize: "0.8rem" }}>
              Add goals or activities you want to start doing again.
            </li>
          ) : (
            identity.reclaim.map((item, index) => (
              <li key={index} className="reclaim-item">
                <span>{item}</span>
                <button className="btn-delete-item delete-reclaim" onClick={() => onRemoveReclaim(index)}>
                  &times;
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="identity-input-group">
          <input
            type="text"
            id="reclaim-input"
            placeholder="e.g. Guitar, hiking, reading..."
            value={reclaimInput}
            onChange={(e) => setReclaimInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddReclaim()}
          />
          <button className="btn-add" id="btn-add-reclaim" onClick={handleAddReclaim}>
            +
          </button>
        </div>
      </div>

      {/* Becoming */}
      <div className="identity-section-card">
        <h3>🌟 Who I'm Becoming</h3>
        <p>Write freely about the person you want to grow into.</p>
        <textarea
          id="becoming-textarea"
          placeholder="I am becoming someone who..."
          maxLength={1000}
          value={becomingText}
          onChange={(e) => setBecomingText(e.target.value)}
        ></textarea>
        <button className="btn-primary" id="btn-save-becoming" onClick={handleSaveBecoming}>
          Save Vision
        </button>
        <p className={`becoming-saved-msg ${!becomingSaved ? "hidden" : ""}`} id="becoming-saved-msg">
          ✓ Saved
        </p>
      </div>
    </div>
  );
}
