"use client";

import React, { useState, useEffect } from "react";
import { LetterEntry } from "@/types";

interface FutureLettersProps {
  letters: LetterEntry[];
  onSaveLetter: (text: string, duration: number, moodTag: string) => void;
  onOpenLetter: (id: string) => void;
  onDeleteLetter: (id: string) => void;
}

export default function FutureLetters({
  letters,
  onSaveLetter,
  onOpenLetter,
  onDeleteLetter,
}: FutureLettersProps) {
  const [activeSubTab, setActiveSubTab] = useState<"write" | "vault">("write");
  const [text, setText] = useState("");
  const [moodTag, setMoodTag] = useState("😐");
  const [lockTime, setLockTime] = useState("1");
  const [shakeInput, setShakeInput] = useState(false);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 400);
      return;
    }
    const duration = parseFloat(lockTime);
    onSaveLetter(trimmed, duration, moodTag);

    // Reset fields and go to Vault tab
    setText("");
    setMoodTag("😐");
    setLockTime("1");
    setActiveSubTab("vault");
  };

  return (
    <div id="future-letters-wrap" className="future-content-wrap">
      <div className="section-header" style={{ marginBottom: "16px" }}>
        <h2>Letter to my Future Self</h2>
        <p>Lock your thoughts away. Read them later to see how far you've come.</p>
      </div>

      <div className="letter-sub-tabs">
        <button
          id="tab-write"
          className={`letter-sub-tab ${activeSubTab === "write" ? "active" : ""}`}
          onClick={() => setActiveSubTab("write")}
        >
          Write
        </button>
        <button
          id="tab-vault"
          className={`letter-sub-tab ${activeSubTab === "vault" ? "active" : ""}`}
          onClick={() => setActiveSubTab("vault")}
        >
          Vault ({letters.length})
        </button>
      </div>

      {activeSubTab === "write" ? (
        <div id="future-write-screen" className="letter-sub-content">
          <div className="future-textarea-wrap">
            <textarea
              id="future-letter-input"
              placeholder="Dear future me, right now I'm feeling... but I know that when you read this, things will be different."
              maxLength={2000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ animation: shakeInput ? "bounce 0.4s ease" : "none" }}
            ></textarea>
          </div>
          <div className="future-meta-row">
            <div className="future-mood-tag">
              <label>Current mood:</label>
              <select
                id="letter-mood-tag"
                value={moodTag}
                onChange={(e) => setMoodTag(e.target.value)}
              >
                <option value="😭">😭 Devastated</option>
                <option value="😢">😢 Sad</option>
                <option value="😔">😔 Low</option>
                <option value="😐">😐 Numb</option>
                <option value="😤">😤 Angry</option>
                <option value="🙂">🙂 Okay</option>
                <option value="🌱">🌱 Hopeful</option>
              </select>
            </div>
            <div className="future-lock-settings">
              <label>Lock for:</label>
              <select
                id="future-lock-time"
                value={lockTime}
                onChange={(e) => setLockTime(e.target.value)}
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="0.0001">10s (Test)</option>
              </select>
            </div>
          </div>
          <button id="btn-save-letter" className="btn-primary" onClick={handleSave}>
            Lock Letter in Vault 🔒
          </button>
        </div>
      ) : (
        <div id="future-vault-screen" className="letter-sub-content">
          {letters.length === 0 ? (
            <div id="no-letters-msg" className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Your vault is empty. Write your first letter.</p>
            </div>
          ) : (
            <ul id="letters-list" className="letters-list">
              {letters.map((letter) => (
                <LetterCard
                  key={letter.id}
                  letter={letter}
                  onOpen={onOpenLetter}
                  onDelete={onDeleteLetter}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

interface LetterCardProps {
  letter: LetterEntry;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

function LetterCard({ letter, onOpen, onDelete }: LetterCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(Date.now() >= letter.unlockAt);
  const [countdownText, setCountdownText] = useState("");

  useEffect(() => {
    if (isUnlocked) return;

    const tick = () => {
      const diff = letter.unlockAt - Date.now();
      if (diff <= 0) {
        setIsUnlocked(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdownText(`⏳ Unlocks in ${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setCountdownText(`⏳ Unlocks in ${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setCountdownText(`⏳ Unlocks in ${minutes}m ${seconds}s`);
      } else {
        setCountdownText(`⏳ Unlocks in ${seconds}s`);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [letter.unlockAt, isUnlocked]);

  const createdDateStr = new Date(letter.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <li className={`letter-card ${isUnlocked ? "unlocked" : "locked"}`}>
      <div className="letter-card-header">
        <div>
          <span className="letter-badge">{isUnlocked ? "Unlocked" : "Locked Vault"}</span>
          <span className="letter-date">Written {createdDateStr}</span>
        </div>
        <span className="letter-mood-sealed" title="Mood when sealed">
          {letter.moodTag || "😐"}
        </span>
      </div>

      {isUnlocked ? (
        letter.isOpen ? (
          <>
            <div className="letter-card-body">{letter.text}</div>
            <button
              className="btn-delete-item delete-letter"
              style={{
                float: "right",
                border: "none",
                background: "transparent",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "8px 0 0 0",
              }}
              onClick={() => onDelete(letter.id)}
            >
              Delete Letter
            </button>
            <div style={{ clear: "both" }}></div>
          </>
        ) : (
          <>
            <div className="letter-card-body">
              Your message to the future is unlocked. Are you ready to see how you have evolved?
            </div>
            <button className="btn-open-letter" onClick={() => onOpen(letter.id)}>
              Open Letter
            </button>
          </>
        )
      ) : (
        <div className="letter-countdown">{countdownText || "⏳ Calculating remaining lock time..."}</div>
      )}
    </li>
  );
}
