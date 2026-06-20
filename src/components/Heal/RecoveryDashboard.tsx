"use client";

import React from "react";
import { DashboardDay, MoodEntry } from "@/types";
import { triggerHaptic } from "@/utils/haptics";

interface RecoveryDashboardProps {
  dashboardDay: DashboardDay;
  ncStart: string | null;
  moodHistory: MoodEntry[];
  urgesCount: number;
  profileChecksCount: number;
  onUpdateDashboard: (data: Partial<DashboardDay>) => void;
  getTodayDateString: () => string;
}

const MOOD_EMOJIS: Record<number, string> = {
  1: "😭", 2: "😢", 3: "😞", 4: "😔", 5: "😐",
  6: "🙂", 7: "😊", 8: "😄", 9: "🤩", 10: "🌟",
};

export default function RecoveryDashboard({
  dashboardDay,
  ncStart,
  moodHistory,
  urgesCount,
  profileChecksCount,
  onUpdateDashboard,
  getTodayDateString,
}: RecoveryDashboardProps) {
  const todayStr = getTodayDateString();
  const todayMood = moodHistory.find((m) => m.date === todayStr);

  const getNcDays = () => {
    if (!ncStart) return null;
    const start = new Date(ncStart);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const ncDays = getNcDays();

  const StatCard = ({
    label,
    value,
    sub,
    color,
  }: {
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
  }) => (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      padding: "14px 12px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      textAlign: "center",
    }}>
      <span style={{
        fontFamily: "var(--font-head)",
        fontSize: "1.6rem",
        fontWeight: 800,
        color: color || "var(--text-primary)",
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </span>
      {sub && <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{sub}</span>}
    </div>
  );

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(79,70,229,0.04), rgba(255,117,140,0.03))",
      border: "1px solid rgba(79,70,229,0.12)",
      borderRadius: "22px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}>
      {/* Header */}
      <div>
        <h3 style={{ fontFamily: "var(--font-head)", fontSize: "1.05rem", fontWeight: 700, marginBottom: "2px" }}>
          Recovery Snapshot
        </h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
        <StatCard
          label="NC Day"
          value={ncDays !== null ? `${ncDays}` : "—"}
          color="var(--red)"
        />
        <StatCard
          label="Mood"
          value={todayMood ? MOOD_EMOJIS[todayMood.score] || todayMood.score : "—"}
          sub={todayMood ? `${todayMood.score}/10` : undefined}
        />
        <StatCard
          label="Urges"
          value={urgesCount}
          color={urgesCount > 5 ? "var(--amber)" : "var(--text-primary)"}
        />
        <StatCard
          label="Checks"
          value={profileChecksCount}
          color={profileChecksCount > 5 ? "var(--red)" : "var(--text-primary)"}
        />
      </div>

      {/* Manual inputs */}
      <div style={{
        background: "rgba(255,255,255,0.5)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        {/* Sleep */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>😴 Sleep</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={dashboardDay.sleep ?? ""}
              onChange={(e) => {
                triggerHaptic(5);
                const val = parseFloat(e.target.value);
                onUpdateDashboard({ sleep: isNaN(val) ? undefined : val });
              }}
              placeholder="—"
              style={{
                width: "52px",
                textAlign: "center",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "5px 6px",
                fontSize: "0.85rem",
                color: "var(--text-primary)",
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>hrs</span>
          </div>
        </div>

        {/* Meals */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>🍽️ Meals</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {[0, 1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => { triggerHaptic(10); onUpdateDashboard({ meals: n }); }}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: dashboardDay.meals === n
                    ? "var(--grad-hero)"
                    : "rgba(0,0,0,0.03)",
                  color: dashboardDay.meals === n ? "white" : "var(--text-secondary)",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "var(--tr)",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>🏃 Exercise</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {[true, false].map((val) => (
              <button
                key={String(val)}
                onClick={() => { triggerHaptic(10); onUpdateDashboard({ exercised: val }); }}
                style={{
                  padding: "5px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: dashboardDay.exercised === val
                    ? val ? "rgba(5,150,105,0.15)" : "rgba(239,68,68,0.1)"
                    : "rgba(0,0,0,0.03)",
                  color: dashboardDay.exercised === val
                    ? val ? "var(--emerald)" : "var(--red)"
                    : "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  transition: "var(--tr)",
                }}
              >
                {val ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
