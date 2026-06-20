"use client";

import React, { useState, useEffect, useRef } from "react";
import { UrgeEntry } from "@/types";
import { triggerHaptic } from "@/utils/haptics";

interface UrgeLogProps {
  urges: UrgeEntry[];
  onLogUrge: (category: string) => void;
  onDeleteUrge: (id: string) => void;
  getTodayDateString: () => string;
}

const URGE_CATEGORIES = [
  { id: "instagram", label: "Check Instagram", emoji: "📱" },
  { id: "old_chats", label: "Read old chats", emoji: "💬" },
  { id: "send_message", label: "Send a message", emoji: "✉️" },
  { id: "call_her", label: "Call / text her", emoji: "📞" },
  { id: "mutuals", label: "Check mutuals", emoji: "👥" },
  { id: "other", label: "Something else", emoji: "🌀" },
];

const COUNTDOWN_SECONDS = 600; // 10 minutes

export default function UrgeLog({ urges, onLogUrge, onDeleteUrge, getTodayDateString }: UrgeLogProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastCategory, setLastCategory] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const todayStr = getTodayDateString();
  const todayUrges = urges.filter((u) => {
    const d = new Date(u.timestamp);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return ds === todayStr;
  });

  const categoryCounts = URGE_CATEGORIES.map((c) => ({
    ...c,
    count: todayUrges.filter((u) => u.category === c.id).length,
  }));

  const topCategory = categoryCounts.sort((a, b) => b.count - a.count)[0];

  const handleCategorySelect = (categoryId: string) => {
    triggerHaptic(25);
    onLogUrge(categoryId);
    const cat = URGE_CATEGORIES.find((c) => c.id === categoryId);
    setLastCategory(cat?.label || categoryId);
    setShowPicker(false);
    setCountdown(COUNTDOWN_SECONDS);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(245,158,11,0.04), rgba(239,68,68,0.03))",
      border: "1px solid rgba(245,158,11,0.15)",
      borderRadius: "22px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 600, marginBottom: "2px" }}>
            ⚡ Urge Tracker
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Log it. Name it. Let it pass.
          </p>
        </div>
        <div style={{
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "20px",
          padding: "4px 12px",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "var(--amber)",
        }}>
          {todayUrges.length} today
        </div>
      </div>

      {/* Countdown banner */}
      {countdown !== null && (
        <div style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "14px",
          padding: "14px",
          textAlign: "center",
          animation: "fade-in 0.3s ease",
        }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            Urge logged: <strong>{lastCategory}</strong>
          </div>
          <div style={{
            fontFamily: "var(--font-head)",
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "var(--amber)",
          }}>
            {formatCountdown(countdown)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Most urges pass in 10 minutes. Stay here.
          </div>
        </div>
      )}

      {/* Main CTA */}
      {!showPicker ? (
        <button
          onClick={() => { triggerHaptic(15); setShowPicker(true); }}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "16px",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: "var(--amber)",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            transition: "var(--tr)",
          }}
        >
          ⚡ I have an urge right now
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "slide-down 0.3s ease" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "center" }}>
            What do you want to do?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {URGE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                style={{
                  padding: "12px 10px",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "var(--tr)",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { triggerHaptic(10); setShowPicker(false); }}
            className="btn-secondary"
            style={{ fontSize: "0.78rem", padding: "8px" }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Stats */}
      {todayUrges.length > 0 && topCategory.count > 0 && (
        <div style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          background: "rgba(0,0,0,0.02)",
          borderRadius: "10px",
          padding: "8px 12px",
        }}>
          Most common today: <strong style={{ color: "var(--text-secondary)" }}>
            {topCategory.emoji} {topCategory.label}
          </strong> ({topCategory.count}×)
        </div>
      )}

      {/* Today's log */}
      {todayUrges.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h4 style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Today's log
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
            {[...todayUrges].reverse().slice(0, 8).map((urge) => {
              const cat = URGE_CATEGORIES.find((c) => c.id === urge.category);
              return (
                <li
                  key={urge.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.5)",
                    borderRadius: "10px",
                    fontSize: "0.8rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {cat?.emoji} {cat?.label || urge.category}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {formatTime(urge.timestamp)}
                    </span>
                    <button
                      className="btn-delete-item"
                      onClick={() => { triggerHaptic(10); onDeleteUrge(urge.id); }}
                      style={{ fontSize: "0.85rem" }}
                    >
                      ×
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
