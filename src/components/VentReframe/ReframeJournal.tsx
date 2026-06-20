"use client";

import React, { useState } from "react";
import { ReframeEntry } from "@/types";

interface ReframeJournalProps {
  reframes: ReframeEntry[];
  onSaveReframe: (thought: string, challenge: string, balanced: string) => void;
  onDeleteReframe: (id: string) => void;
}

const challengePrompts = [
  "Is this thought 100% true? What evidence do you actually have against it?",
  "What would you say to a close friend who had this exact thought?",
  "Is this feeling a fact, or is it an interpretation?",
  "Will this matter in 1 year? In 5 years?",
  "What is a more balanced way to see this situation?",
  "Am I catastrophizing or assuming the worst-case scenario?",
  "Am I labeling myself or others instead of looking at the behavior?"
];

export default function ReframeJournal({ reframes, onSaveReframe, onDeleteReframe }: ReframeJournalProps) {
  const [thought, setThought] = useState("");
  const [challenge, setChallenge] = useState("");
  const [balanced, setBalanced] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);

  const [shakeThought, setShakeThought] = useState(false);
  const [shakeChallenge, setShakeChallenge] = useState(false);
  const [shakeBalanced, setShakeBalanced] = useState(false);

  const handleNextPrompt = (e: React.MouseEvent) => {
    e.preventDefault();
    setPromptIdx((prev) => (prev + 1) % challengePrompts.length);
  };

  const handleSave = () => {
    let hasEmpty = false;

    if (!thought.trim()) {
      setShakeThought(true);
      setTimeout(() => setShakeThought(false), 400);
      hasEmpty = true;
    }
    if (!challenge.trim()) {
      setShakeChallenge(true);
      setTimeout(() => setShakeChallenge(false), 400);
      hasEmpty = true;
    }
    if (!balanced.trim()) {
      setShakeBalanced(true);
      setTimeout(() => setShakeBalanced(false), 400);
      hasEmpty = true;
    }

    if (hasEmpty) return;

    onSaveReframe(thought.trim(), challenge.trim(), balanced.trim());
    setThought("");
    setChallenge("");
    setBalanced("");
  };

  return (
    <div id="reframe-mode-content">
      <div className="section-header">
        <h2>Reframe Your Thoughts</h2>
        <p>Challenge the story your mind is telling you. 3 steps to clarity.</p>
      </div>

      <div className="reframe-form">
        {/* Step 1 */}
        <div className="reframe-step">
          <div className="step-label">
            <span className="step-number">1</span>
            <span>What's the automatic thought?</span>
          </div>
          <textarea
            id="reframe-thought"
            placeholder='e.g. "I will never find love again" or "This is all my fault"'
            maxLength={300}
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            style={{ animation: shakeThought ? "bounce 0.4s ease" : "none" }}
          ></textarea>
        </div>

        {/* Step 2 */}
        <div className="reframe-step">
          <div className="step-label">
            <span className="step-number">2</span>
            <span>Challenge it</span>
          </div>
          <div className="challenge-prompts">
            <p className="challenge-q" id="challenge-prompt">
              {challengePrompts[promptIdx]}
            </p>
            <button className="btn-tiny" id="btn-next-prompt" onClick={handleNextPrompt}>
              Different question →
            </button>
          </div>
          <textarea
            id="reframe-challenge"
            placeholder="Write your honest answer here..."
            maxLength={400}
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            style={{ animation: shakeChallenge ? "bounce 0.4s ease" : "none" }}
          ></textarea>
        </div>

        {/* Step 3 */}
        <div className="reframe-step">
          <div className="step-label">
            <span className="step-number">3</span>
            <span>Write a balanced reframe</span>
          </div>
          <textarea
            id="reframe-balanced"
            placeholder='e.g. "I am in pain right now, but I have loved and been loved before. I will heal."'
            maxLength={400}
            value={balanced}
            onChange={(e) => setBalanced(e.target.value)}
            style={{ animation: shakeBalanced ? "bounce 0.4s ease" : "none" }}
          ></textarea>
        </div>

        <button className="btn-primary" id="btn-save-reframe" onClick={handleSave}>
          Save Reframe
        </button>
      </div>

      {/* Saved Reframes List */}
      <div className="reframes-history" id="reframes-history">
        <h3>Your Reframe Library</h3>
        {reframes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧠</div>
            <p>
              No reframed thoughts yet. Reframing teaches your mind to process facts, not
              distortions.
            </p>
          </div>
        ) : (
          <ul id="reframes-list" className="reframes-list">
            {reframes.map((item) => {
              const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
              return (
                <li key={item.id} className="reframe-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "2px",
                    }}
                  >
                    <span className="reframe-card-date">{dateStr}</span>
                    <button
                      className="btn-delete-item delete-reframe"
                      style={{ border: "none", cursor: "pointer", background: "transparent" }}
                      onClick={() => onDeleteReframe(item.id)}
                    >
                      &times;
                    </button>
                  </div>
                  <div
                    className="reframe-card-original"
                    style={{ textDecoration: "line-through", opacity: 0.6, fontSize: "0.8rem" }}
                  >
                    "{item.thought}"
                  </div>
                  <div
                    className="reframe-card-arrow"
                    style={{ fontSize: "0.72rem", color: "#818cf8", margin: "2px 0" }}
                  >
                    ↓ challenged: <em>"{item.challenge}"</em>
                  </div>
                  <div
                    className="reframe-card-balanced"
                    style={{ fontSize: "0.86rem", color: "#34d399", fontWeight: 500 }}
                  >
                    🌱 "{item.balanced}"
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
