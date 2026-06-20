"use client";

import React, { useEffect, useState } from "react";

const affirmations = [
  "Healing isn't linear. Having a hard day doesn't mean you're failing; it means you are processing.",
  "Your worth is determined by you, not by someone else's inability to see it.",
  "You are allowed to feel sad, angry, and hopeful all at the same time.",
  "Every wave of grief you survive is a step closer to peace.",
  "You survived without them before, and you will thrive without them again.",
  "Forgiving them is about your freedom, not their absolution.",
  "Your nervous system is slowly learning it is safe to be alone. Give it time.",
  "It is okay to miss a version of them that no longer exists.",
  "You are not hard to love; you were just trying to grow in soil that couldn't support you.",
  "Letting go is a daily decision to choose yourself.",
  "Your peace of mind is worth more than any explanation they could offer.",
  "The love you gave them still belongs to you. It is yours to keep and redirect.",
  "You did not lose them; you were redirected to yourself.",
  "Close the door to the past, not out of anger, but to protect your energy.",
  "Your value did not decrease based on their inability to appreciate you.",
  "It is brave to feel everything you are feeling right now.",
  "Your future is not cancelled. It is just being rewritten.",
  "Be gentle with yourself. You are doing the hard work of rebuilding.",
  "You do not need their validation to heal or move forward.",
  "Letting go of what is not meant for you makes space for what is.",
  "You are allowed to protect your boundary, even if it hurts.",
  "You are stronger than the temporary discomfort of nostalgia.",
  "Your path is yours alone. Comparison will only steal your joy.",
  "Accept what is, let go of what was, and have faith in what can be.",
  "Pain is a visitor, not a permanent resident in your heart.",
  "You are worthy of a love that stays, respects, and grows with you.",
  "This heartbreak is a season of your life, not the final chapter.",
  "Every boundary you set is a promise of self-respect.",
  "You are reclaiming your time, your space, and your identity.",
  "The healing you seek is already happening, one deep breath at a time.",
  "Your heart is resilient. It knows how to mend, if you let it.",
  "You are enough, exactly as you are, right here and now."
];

interface AffirmationsProps {
  onExpandGrounding: () => void;
}

export default function Affirmations({ onExpandGrounding }: AffirmationsProps) {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const today = new Date();
    const seed =
      (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) %
      affirmations.length;
    setQuote(affirmations[seed]);
  }, []);

  return (
    <div className="affirmation-card" id="affirmation-card">
      <div className="affirmation-quote-wrap">
        <span className="affirmation-icon">✦</span>
        <p className="affirmation-text" id="affirmation-text">
          {quote || "Loading your affirmation..."}
        </p>
      </div>
      <button
        className="affirmation-ground-btn"
        id="btn-grounding-expand"
        onClick={onExpandGrounding}
      >
        5-4-3-2-1 Grounding ↓
      </button>
    </div>
  );
}
