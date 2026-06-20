"use client";

import React from "react";
import { ProfileCheck } from "@/types";
import { triggerHaptic } from "@/utils/haptics";

interface ProfileCheckTrackerProps {
  checks: ProfileCheck[];
  onCheck: () => void;
  getTodayDateString: () => string;
}

export default function ProfileCheckTracker({ checks, onCheck, getTodayDateString }: ProfileCheckTrackerProps) {
  const todayStr = getTodayDateString();
  const todayChecks = checks.filter((c) => {
    const d = new Date(c.timestamp);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return ds === todayStr;
  });

  const count = todayChecks.length;

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getColorByCount = () => {
    if (count === 0) return { bg: "rgba(0,0,0,0.02)", border: "var(--border)", color: "var(--text-muted)" };
    if (count < 5) return { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", color: "var(--amber)" };
    if (count < 15) return { bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.18)", color: "var(--red)" };
    return { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", color: "var(--red)" };
  };

  const colors = getColorByCount();

  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: "22px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 600, marginBottom: "2px" }}>
            📱 Profile Check Tracker
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Awareness reduces the compulsion.
          </p>
        </div>
        {/* Big count display */}
        <div style={{
          fontFamily: "var(--font-head)",
          fontSize: "2.4rem",
          fontWeight: 800,
          color: colors.color,
          lineHeight: 1,
        }}>
          {count}
        </div>
      </div>

      {/* Message based on count */}
      {count > 0 && (
        <div style={{
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
          background: "rgba(0,0,0,0.02)",
          borderRadius: "10px",
          padding: "8px 12px",
          lineHeight: 1.4,
        }}>
          {count < 5 && "You're doing okay. Keep it low."}
          {count >= 5 && count < 10 && "You've checked several times today. Notice the pattern."}
          {count >= 10 && count < 20 && "Each check makes it harder. You know what you'll find — nothing new."}
          {count >= 20 && "This is feeding the loop. Close the app. Put the phone down. You already know the story."}
        </div>
      )}

      {/* One-tap button */}
      <button
        onClick={() => { triggerHaptic(20); onCheck(); }}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "16px",
          background: "rgba(239,68,68,0.07)",
          border: "1px solid rgba(239,68,68,0.18)",
          color: "var(--red)",
          fontWeight: 700,
          fontSize: "0.92rem",
          cursor: "pointer",
          transition: "var(--tr)",
        }}
      >
        I just checked her profile
      </button>

      {/* Recent checks */}
      {todayChecks.length > 0 && (
        <div>
          <h4 style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "6px",
          }}>
            Today ({count} {count === 1 ? "check" : "checks"})
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {[...todayChecks].reverse().slice(0, 10).map((c) => (
              <span
                key={c.id}
                style={{
                  background: "rgba(239,68,68,0.05)",
                  border: "1px solid rgba(239,68,68,0.1)",
                  borderRadius: "20px",
                  padding: "3px 9px",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                }}
              >
                {formatTime(c.timestamp)}
              </span>
            ))}
            {todayChecks.length > 10 && (
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", padding: "3px 6px" }}>
                +{todayChecks.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
