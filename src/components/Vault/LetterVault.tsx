"use client";

import React, { useState } from "react";
import { UnsentLetter } from "@/types";
import { triggerHaptic } from "@/utils/haptics";

interface LetterVaultProps {
  letters: UnsentLetter[];
  onSaveLetter: (text: string, category: string) => void;
  onDeleteLetter: (id: string) => void;
}

const CATEGORIES = [
  { id: "unsaid", label: "Things I wish I could say", emoji: "💭" },
  { id: "anger", label: "What I'm angry about", emoji: "🔥" },
  { id: "missing", label: "What I miss", emoji: "🌙" },
  { id: "gratitude", label: "What I'm grateful for", emoji: "🌸" },
];

export default function LetterVault({ letters, onSaveLetter, onDeleteLetter }: LetterVaultProps) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("unsaid");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    triggerHaptic(25);
    onSaveLetter(text.trim(), category);
    setText("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const getCategoryInfo = (id: string) =>
    CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Intro */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,117,140,0.05), rgba(138,43,226,0.04))",
        border: "1px solid rgba(255,117,140,0.15)",
        borderRadius: "18px",
        padding: "16px",
      }}>
        <h3 style={{ fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 600, marginBottom: "4px" }}>
          💌 Letter Vault
        </h3>
        <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
          Write what you can't say. It stays here. It never sends.
          Many therapists recommend this — putting it into words helps the nervous system release it.
        </p>
      </div>

      {/* Category selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          This letter is about...
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { triggerHaptic(10); setCategory(cat.id); }}
              style={{
                padding: "10px 8px",
                borderRadius: "12px",
                border: `1px solid ${category === cat.id ? "rgba(255,117,140,0.4)" : "var(--border)"}`,
                background: category === cat.id ? "rgba(255,117,140,0.08)" : "rgba(0,0,0,0.02)",
                color: category === cat.id ? "var(--pink)" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "0.74rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "var(--tr)",
              }}
            >
              <span>{cat.emoji}</span>
              <span style={{ textAlign: "left", lineHeight: 1.2 }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write freely. No one will ever see this. Let it out..."
        style={{
          width: "100%",
          minHeight: "160px",
          background: "rgba(255,255,255,0.7)",
          border: "1px solid var(--border)",
          borderRadius: "18px",
          padding: "18px",
          fontSize: "0.9rem",
          lineHeight: 1.55,
          resize: "none",
          color: "var(--text-primary)",
          transition: "var(--tr)",
          fontFamily: "var(--font-body)",
        }}
      />

      <button
        onClick={handleSave}
        disabled={!text.trim()}
        className="btn-primary"
        style={{ opacity: text.trim() ? 1 : 0.5 }}
      >
        {saved ? "✓ Letter sealed" : "Seal & Save Letter"}
      </button>

      {/* Letters list */}
      {letters.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h4 style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            {letters.length} saved {letters.length === 1 ? "letter" : "letters"}
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...letters].reverse().map((letter) => {
              const cat = getCategoryInfo(letter.category);
              const isExpanded = expandedId === letter.id;
              return (
                <li
                  key={letter.id}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid var(--pink)`,
                    borderRadius: "14px",
                    padding: "14px",
                    animation: "list-slide 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "1rem" }}>{cat.emoji}</span>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "var(--pink)",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}>
                        {cat.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                        {formatDate(letter.createdAt)}
                      </span>
                      <button
                        className="btn-delete-item"
                        onClick={() => { triggerHaptic(10); onDeleteLetter(letter.id); }}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <>
                      <p style={{
                        fontSize: "0.88rem",
                        lineHeight: 1.5,
                        color: "var(--text-primary)",
                        whiteSpace: "pre-wrap",
                        marginBottom: "10px",
                        userSelect: "text",
                      }}>
                        {letter.text}
                      </p>
                      <button
                        className="btn-tiny"
                        onClick={() => setExpandedId(null)}
                        style={{ color: "var(--text-muted)" }}
                      >
                        Close ↑
                      </button>
                    </>
                  ) : (
                    <div
                      onClick={() => { triggerHaptic(5); setExpandedId(letter.id); }}
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        lineHeight: 1.4,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {letter.text}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
