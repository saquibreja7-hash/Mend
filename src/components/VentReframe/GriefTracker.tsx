"use client";

import React from "react";

interface GriefTrackerProps {
  griefStage: string | null;
  onStageSelect: (stage: string) => void;
}

const griefStages = {
  denial: {
    label: "Denial",
    emoji: "😶",
    color: "#6366f1",
    message: "Denial is a shock absorber for your soul. Feeling numb, disbelieving, or hoping they will call is a normal defense mechanism. Take a deep breath: you don't have to figure it all out today.",
    tip: "Coping Tip: Write down three objective facts about the breakup to ground your mind in reality when hope takes over."
  },
  anger: {
    label: "Anger",
    emoji: "😤",
    color: "#ef4444",
    message: "Anger is pain's bodyguard. It is a healthy, active energy that protects your self-respect. Let yourself feel mad, but direct that energy safely. Do not contact them out of anger.",
    tip: "Coping Tip: Use the Vent Wall to 'Burn It' or do a physical activity like a sprint or screaming into a pillow."
  },
  bargaining: {
    label: "Bargaining",
    emoji: "🙏",
    color: "#f59e0b",
    message: "Bargaining is the 'what-if' loop. Your brain is trying to find a compromise or a time machine to avoid pain. Remind yourself: both of you behaved in ways that led to this. It wasn't just one moment.",
    tip: "Coping Tip: When a 'what-if' thought arises, counter it with: 'I did the best I could with what I knew then.'"
  },
  depression: {
    label: "Depression",
    emoji: "😔",
    color: "#8b5cf6",
    message: "Depression is the heavy, quiet realization of loss. It feels empty and exhausting. This is your nervous system forcing you to rest and process. It is okay to not be okay right now.",
    tip: "Coping Tip: Do just one tiny self-care checklist item today (like drinking water). Showers or warm tea can help."
  },
  acceptance: {
    label: "Acceptance",
    emoji: "🌱",
    color: "#10b981",
    message: "Acceptance is not approval; it is simply acknowledging what is. It means you are ready to stop fighting the reality of the present. You are beginning to rebuild your own life.",
    tip: "Coping Tip: Celebrate this moment of peace. Add a value or a new goal to your Identity Board."
  }
};

type StageKey = keyof typeof griefStages;

export default function GriefTracker({ griefStage, onStageSelect }: GriefTrackerProps) {
  const currentStage = griefStage && griefStages[griefStage as StageKey] ? griefStages[griefStage as StageKey] : null;

  return (
    <div className="grief-tracker-card" id="grief-tracker">
      <div className="grief-header">
        <h3>Where are you today?</h3>
        <p>Name your stage — labeling emotions reduces their intensity.</p>
      </div>
      <div className="grief-stages" id="grief-stages">
        {(Object.keys(griefStages) as StageKey[]).map((key) => {
          const stage = griefStages[key];
          const isActive = griefStage === key;
          const style = isActive
            ? {
                borderColor: stage.color,
                boxShadow: `0 0 12px ${stage.color}33`,
              }
            : {};

          return (
            <button
              key={key}
              className={`grief-btn ${isActive ? "active" : ""}`}
              style={style}
              onClick={() => onStageSelect(key)}
            >
              <span className="grief-emoji">{stage.emoji}</span>
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>
      {currentStage && (
        <div className="grief-message" id="grief-message">
          <p id="grief-message-text">
            <strong>{currentStage.message}</strong>
            <br />
            <br />
            {currentStage.tip}
          </p>
        </div>
      )}
    </div>
  );
}
