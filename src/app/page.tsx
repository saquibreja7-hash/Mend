"use client";

import React, { useState, useEffect } from "react";
import { SelfCareItem, MoodEntry, ReframeEntry, LetterEntry, IdentityData } from "@/types";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

// Views & Overlays
import Affirmations from "@/components/VentReframe/Affirmations";
import GroundingPanel from "@/components/VentReframe/GroundingPanel";
import GriefTracker from "@/components/VentReframe/GriefTracker";
import VentWall from "@/components/VentReframe/VentWall";
import ReframeJournal from "@/components/VentReframe/ReframeJournal";
import NCCounter from "@/components/Truths/NCCounter";
import RealityCheck from "@/components/Truths/RealityCheck";
import PanicOverlay from "@/components/Truths/PanicOverlay";
import MoodTracker from "@/components/Heal/MoodTracker";
import SurvivalChecklist from "@/components/Heal/SurvivalChecklist";
import BreathingGuide from "@/components/Breathe/BreathingGuide";
import FutureLetters from "@/components/Vault/FutureLetters";
import IdentityBoard from "@/components/Vault/IdentityBoard";
import Onboarding from "@/components/Onboarding";
import SettingsDrawer from "@/components/SettingsDrawer";
import ConfirmModal from "@/components/ConfirmModal";

// Utilities
import { triggerHaptic } from "@/utils/haptics";
import { safeGetItem, safeSetItem, safeRemoveItem, safeJsonParse } from "@/utils/storage";

const defaultSelfCareItems: SelfCareItem[] = [
  { id: "water", title: "Hydrate", desc: "Drank at least 3 glasses of water today.", checked: false },
  { id: "meal", title: "Nourish", desc: "Ate a healthy, solid meal.", checked: false },
  { id: "shower", title: "Refresh", desc: "Showered and put on fresh clothes.", checked: false },
  { id: "social", title: "Digital Boundary", desc: "Did not check their social media profiles.", checked: false },
  { id: "outside", title: "Grounding", desc: "Stepped outside or opened windows for 5+ minutes.", checked: false },
];

const defaultRealityChecks = [
  "We weren't growing together anymore.",
  "My peace and self-respect are worth more than a text message.",
  "Remember how lonely it felt when we were together near the end.",
  "I cannot force someone to choose me.",
];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  // App Navigation Views
  const [currentView, setCurrentView] = useState("view-vent");
  const [ventMode, setVentMode] = useState<"vent" | "reframe">("vent");
  const [vaultSubTab, setVaultSubTab] = useState<"letters" | "identity">("letters");

  // State Properties
  const [streak, setStreak] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const [griefStage, setGriefStage] = useState<string | null>(null);
  const [ncStart, setNcStart] = useState<string | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [reframes, setReframes] = useState<ReframeEntry[]>([]);
  const [realityChecks, setRealityChecks] = useState<string[]>([]);
  const [selfCareItems, setSelfCareItems] = useState<SelfCareItem[]>(defaultSelfCareItems);
  const [customChecklistItems, setCustomChecklistItems] = useState<SelfCareItem[]>([]);
  const [letters, setLetters] = useState<LetterEntry[]>([]);
  const [identity, setIdentity] = useState<IdentityData>({ values: [], reclaim: [], becoming: "" });

  // Custom User settings & onboarding states
  const [username, setUsername] = useState("");
  const [onboarded, setOnboarded] = useState(true);

  // UI state overlays
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [panicOpen, setPanicOpen] = useState(false);
  const [ncResetOpen, setNcResetOpen] = useState(false);
  const [healingPercentage, setHealingPercentage] = useState(0);

  // Reusable confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Helper date utility
  const getTodayDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  // Generic Confirmation modal trigger
  const showConfirm = (title: string, message: string, action: () => void) => {
    triggerHaptic(10);
    setConfirmConfig({
      title,
      message,
      onConfirm: () => {
        triggerHaptic(30);
        action();
        setConfirmOpen(false);
      },
    });
    setConfirmOpen(true);
  };

  // Mount logic
  useEffect(() => {
    setIsMounted(true);

    // Load onboarding state first
    const savedOnboarded = safeGetItem("mend_onboarded", "false") === "true";
    setOnboarded(savedOnboarded);

    const savedUsername = safeGetItem("mend_username", "") || "";
    setUsername(savedUsername);

    // 1. Streak data & verification
    const savedStreak = safeGetItem("mend_streak", "0");
    const savedLastActive = safeGetItem("mend_last_active", null);
    let currentStreak = 0;
    if (savedStreak) currentStreak = parseInt(savedStreak, 10);

    if (savedLastActive) {
      const today = new Date(getTodayDateString());
      const lastActive = new Date(savedLastActive);
      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        currentStreak = 0;
        safeSetItem("mend_streak", "0");
      }
    }
    setStreak(currentStreak);
    setLastActiveDate(savedLastActive);

    // 2. Grief stage
    setGriefStage(safeGetItem("mend_grief_stage", null));

    // 3. No-Contact
    setNcStart(safeGetItem("mend_nc_start", null));

    // 4. Mood History
    setMoodHistory(safeJsonParse<MoodEntry[]>(safeGetItem("mend_mood_history", null), []));

    // 5. Reframes
    setReframes(safeJsonParse<ReframeEntry[]>(safeGetItem("mend_reframes", null), []));

    // 6. Reality Checks
    const savedReality = safeGetItem("mend_reality_checks", null);
    if (savedReality) {
      setRealityChecks(safeJsonParse<string[]>(savedReality, defaultRealityChecks));
    } else {
      setRealityChecks(defaultRealityChecks);
      safeSetItem("mend_reality_checks", JSON.stringify(defaultRealityChecks));
    }

    // 7. Custom Checklist Items
    const savedCustomChecklist = safeGetItem("mend_custom_checklist", null);
    let loadedCustom: SelfCareItem[] = [];
    if (savedCustomChecklist) {
      loadedCustom = safeJsonParse<SelfCareItem[]>(savedCustomChecklist, []);
      setCustomChecklistItems(loadedCustom);
    }

    // 8. Letters
    setLetters(safeJsonParse<LetterEntry[]>(safeGetItem("mend_letters", null), []));

    // 9. Identity
    setIdentity(safeJsonParse<IdentityData>(safeGetItem("mend_identity", null), { values: [], reclaim: [], becoming: "" }));

    // 10. Checklist reset check
    const todayStr = getTodayDateString();
    const savedChecklist = safeGetItem(`mend_checklist_${todayStr}`, null);
    let initialSelfCare = defaultSelfCareItems.map((i) => ({ ...i }));
    let initialCustom = loadedCustom.map((i) => ({ ...i }));

    if (savedChecklist) {
      const checkedIds = safeJsonParse<string[]>(savedChecklist, []);
      initialSelfCare = initialSelfCare.map((item) => ({
        ...item,
        checked: checkedIds.includes(item.id),
      }));
      initialCustom = initialCustom.map((item) => ({
        ...item,
        checked: checkedIds.includes(item.id),
      }));
    } else {
      // Clean previous dates
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("mend_checklist_")) {
            safeRemoveItem(key);
          }
        });
      }
    }

    setSelfCareItems(initialSelfCare);
    setCustomChecklistItems(initialCustom);

    // Calculate percentage
    const all = [...initialSelfCare, ...initialCustom];
    const checked = all.filter((i) => i.checked).length;
    setHealingPercentage(all.length > 0 ? Math.round((checked / all.length) * 100) : 0);
  }, []);

  // Update healing percentage whenever checklists modify
  useEffect(() => {
    if (!isMounted) return;
    const all = [...selfCareItems, ...customChecklistItems];
    const checked = all.filter((i) => i.checked).length;
    setHealingPercentage(all.length > 0 ? Math.round((checked / all.length) * 100) : 0);
  }, [selfCareItems, customChecklistItems, isMounted]);

  // Service Worker Registration
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => {
          console.log("Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

  // View router change haptic wrapper
  const handleViewChange = (view: string) => {
    triggerHaptic(12);
    setCurrentView(view);
  };

  const handleToggleMode = (mode: "vent" | "reframe") => {
    triggerHaptic(12);
    setVentMode(mode);
  };

  const handleToggleVaultSub = (tab: "letters" | "identity") => {
    triggerHaptic(12);
    setVaultSubTab(tab);
  };

  // Checklist Actions
  const handleToggleItem = (id: string) => {
    triggerHaptic(15);
    let updatedSelfCare = selfCareItems.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
    let updatedCustom = customChecklistItems.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));

    setSelfCareItems(updatedSelfCare);
    setCustomChecklistItems(updatedCustom);

    // Save checks to localStorage
    const todayStr = getTodayDateString();
    const all = [...updatedSelfCare, ...updatedCustom];
    const checkedIds = all.filter((i) => i.checked).map((i) => i.id);
    safeSetItem(`mend_checklist_${todayStr}`, JSON.stringify(checkedIds));

    // Handle streak verification
    const hasCompletedAtLeastOne = checkedIds.length > 0;
    if (hasCompletedAtLeastOne && lastActiveDate !== todayStr) {
      let newStreak = streak;
      if (lastActiveDate) {
        const lastActive = new Date(lastActiveDate);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      setStreak(newStreak);
      setLastActiveDate(todayStr);
      safeSetItem("mend_streak", newStreak.toString());
      safeSetItem("mend_last_active", todayStr);
    }

    // Trigger confetti on 100%
    if (all.length > 0 && checkedIds.length === all.length) {
      triggerConfetti();
    }
  };

  const handleAddCustomItem = (title: string) => {
    triggerHaptic(20);
    const newItem: SelfCareItem = {
      id: "custom_" + Date.now(),
      title,
      desc: "Custom habit",
      checked: false,
    };
    const updated = [...customChecklistItems, newItem];
    setCustomChecklistItems(updated);
    safeSetItem("mend_custom_checklist", JSON.stringify(updated));
  };

  const handleDeleteCustomItem = (id: string) => {
    const item = customChecklistItems.find((i) => i.id === id);
    showConfirm(
      "Delete Custom Habit?",
      `Are you sure you want to remove "${item?.title || "this habit"}" from your routine?`,
      () => {
        const updated = customChecklistItems.filter((i) => i.id !== id);
        setCustomChecklistItems(updated);
        safeSetItem("mend_custom_checklist", JSON.stringify(updated));

        // Sync localStorage checklist checked list
        const todayStr = getTodayDateString();
        const all = [...selfCareItems, ...updated];
        const checkedIds = all.filter((i) => i.checked).map((i) => i.id);
        safeSetItem(`mend_checklist_${todayStr}`, JSON.stringify(checkedIds));
      }
    );
  };

  // Confetti Canvas Particles
  const triggerConfetti = () => {
    const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesList: any[] = [];
    const colors = ["#ff758c", "#ff7eb3", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4"];

    for (let i = 0; i < 80; i++) {
      particlesList.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
      });
    }

    let animationId: number;
    function draw() {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particlesList.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;

        if (p.y < canvas.height) {
          active = true;
        }

        ctx!.beginPath();
        ctx!.lineWidth = p.r;
        ctx!.strokeStyle = p.color;
        ctx!.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx!.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx!.stroke();
      });

      if (active) {
        animationId = requestAnimationFrame(draw);
      } else {
        ctx!.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationId);
      }
    }
    draw();
  };

  const handleGlowHeaderBar = () => {
    const fill = document.getElementById("healing-bar");
    if (fill) {
      fill.style.boxShadow = "0 0 25px #ff758c";
      setTimeout(() => {
        fill.style.boxShadow = "0 0 10px #ff758c";
      }, 1500);
    }
  };

  // Grief stage actions
  const handleStageSelect = (stage: string) => {
    triggerHaptic(15);
    setGriefStage(stage);
    safeSetItem("mend_grief_stage", stage);
  };

  // Reframe actions
  const handleSaveReframe = (thought: string, challenge: string, balanced: string) => {
    triggerHaptic(25);
    const entry: ReframeEntry = {
      id: "reframe_" + Date.now(),
      thought,
      challenge,
      balanced,
      createdAt: Date.now(),
    };
    const updated = [entry, ...reframes];
    setReframes(updated);
    safeSetItem("mend_reframes", JSON.stringify(updated));
    handleGlowHeaderBar();
  };

  const handleDeleteReframe = (id: string) => {
    showConfirm(
      "Delete Reframe?",
      "Are you sure you want to delete this cognitive reframe record? This cannot be undone.",
      () => {
        const updated = reframes.filter((r) => r.id !== id);
        setReframes(updated);
        safeSetItem("mend_reframes", JSON.stringify(updated));
      }
    );
  };

  // No-Contact actions
  const handleStartNC = (startDate: string) => {
    triggerHaptic(25);
    setNcStart(startDate);
    safeSetItem("mend_nc_start", startDate);
  };

  const handleConfirmNCReset = () => {
    triggerHaptic(30);
    setNcStart(null);
    safeRemoveItem("mend_nc_start");
    setNcResetOpen(false);
  };

  // Reality actions
  const handleAddReality = (text: string) => {
    triggerHaptic(20);
    const updated = [...realityChecks, text];
    setRealityChecks(updated);
    safeSetItem("mend_reality_checks", JSON.stringify(updated));
  };

  const handleDeleteReality = (idx: number) => {
    const text = realityChecks[idx];
    showConfirm(
      "Delete Boundary?",
      `Are you sure you want to delete "${text.length > 30 ? text.substring(0, 30) + "..." : text}"?`,
      () => {
        const updated = [...realityChecks];
        updated.splice(idx, 1);
        setRealityChecks(updated);
        safeSetItem("mend_reality_checks", JSON.stringify(updated));
      }
    );
  };

  // Mood Actions
  const handleSaveMood = (score: number) => {
    const todayStr = getTodayDateString();
    const updatedHistory = [...moodHistory];
    const existingIdx = updatedHistory.findIndex((h) => h.date === todayStr);

    if (existingIdx !== -1) {
      updatedHistory[existingIdx].score = score;
    } else {
      updatedHistory.push({ date: todayStr, score });
    }

    setMoodHistory(updatedHistory);
    safeSetItem("mend_mood_history", JSON.stringify(updatedHistory));
    handleGlowHeaderBar();
  };

  // Future Letters Actions
  const handleSaveLetter = (text: string, duration: number, mood: string) => {
    triggerHaptic(25);
    const now = Date.now();
    let unlockAt = now;
    if (duration === 0.0001) {
      unlockAt = now + 10 * 1000; // 10s test
    } else {
      unlockAt = now + duration * 30 * 24 * 60 * 60 * 1000;
    }

    const newLetter: LetterEntry = {
      id: "letter_" + now,
      text,
      createdAt: now,
      unlockAt,
      duration,
      isOpen: false,
      moodTag: mood,
    };

    const updated = [...letters, newLetter];
    setLetters(updated);
    safeSetItem("mend_letters", JSON.stringify(updated));
  };

  const handleOpenLetter = (id: string) => {
    triggerHaptic(25);
    const updated = letters.map((l) => (l.id === id ? { ...l, isOpen: true } : l));
    setLetters(updated);
    safeSetItem("mend_letters", JSON.stringify(updated));
  };

  const handleDeleteLetter = (id: string) => {
    showConfirm(
      "Delete Letter?",
      "Are you sure you want to permanently delete this letter to your future self? This cannot be undone.",
      () => {
        const updated = letters.filter((l) => l.id !== id);
        setLetters(updated);
        safeSetItem("mend_letters", JSON.stringify(updated));
      }
    );
  };

  // Identity Actions
  const handleAddValue = (val: string) => {
    triggerHaptic(15);
    if (identity.values.includes(val)) return;
    const updated = { ...identity, values: [...identity.values, val] };
    setIdentity(updated);
    safeSetItem("mend_identity", JSON.stringify(updated));
  };

  const handleRemoveValue = (val: string) => {
    triggerHaptic(10);
    const updated = { ...identity, values: identity.values.filter((v) => v !== val) };
    setIdentity(updated);
    safeSetItem("mend_identity", JSON.stringify(updated));
  };

  const handleAddReclaim = (item: string) => {
    triggerHaptic(20);
    const updated = { ...identity, reclaim: [...identity.reclaim, item] };
    setIdentity(updated);
    safeSetItem("mend_identity", JSON.stringify(updated));
  };

  const handleRemoveReclaim = (idx: number) => {
    showConfirm("Remove Hobby/Goal?", "Are you sure you want to remove this reclaim item?", () => {
      const updatedReclaim = [...identity.reclaim];
      updatedReclaim.splice(idx, 1);
      const updated = { ...identity, reclaim: updatedReclaim };
      setIdentity(updated);
      safeSetItem("mend_identity", JSON.stringify(updated));
    });
  };

  const handleSaveBecoming = (becoming: string) => {
    triggerHaptic(25);
    const updated = { ...identity, becoming };
    setIdentity(updated);
    safeSetItem("mend_identity", JSON.stringify(updated));
    handleGlowHeaderBar();
  };

  // Settings drawers handlers
  const handleUpdateUsername = (newName: string) => {
    setUsername(newName);
    safeSetItem("mend_username", newName);
  };

  const handleTriggerResetAll = () => {
    showConfirm(
      "Reset All Companion Data?",
      "WARNING: This will permanently wipe all logs, letters, streaks, checks, and settings. This cannot be undone.",
      () => {
        if (typeof window !== "undefined") {
          localStorage.clear();
          window.location.reload();
        }
      }
    );
  };

  const handleImportBackup = (backupData: Record<string, string>) => {
    showConfirm(
      "Import Backup File?",
      "This will replace all your current logs, reframes, letters, and streaks with the backup data. The app will reload.",
      () => {
        if (typeof window !== "undefined") {
          localStorage.clear();
          Object.entries(backupData).forEach(([key, val]) => {
            localStorage.setItem(key, val);
          });
          window.location.reload();
        }
      }
    );
  };

  const handleOnboardingComplete = (chosenName: string) => {
    setOnboarded(true);
    safeSetItem("mend_onboarded", "true");
    if (chosenName) {
      setUsername(chosenName);
      safeSetItem("mend_username", chosenName);
    }
  };

  if (!isMounted) {
    return (
      <div className="mobile-frame-wrapper" style={{ margin: "auto" }}>
        <div className="app-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="brand" style={{ flexDirection: "column", gap: "10px" }}>
            <span className="brand-heart" style={{ fontSize: "2rem" }}>💔</span>
            <h1 style={{ fontSize: "1.8rem" }}>MEND</h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", letterSpacing: "1px" }}>LOADING ENVIRONMENT...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-frame-wrapper" style={{ margin: "auto" }}>
      <div className="app-container">
        {/* Core Header */}
        <Header
          streak={streak}
          ncStart={ncStart}
          healingPercentage={healingPercentage}
          onSettingsClick={() => {
            triggerHaptic(10);
            setSettingsOpen(true);
          }}
        />

        {/* Content Body */}
        <main className="app-content">
          {/* Welcome greetings for logged users */}
          {username && currentView === "view-vent" && (
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                fontWeight: 600,
                letterSpacing: "0.5px",
                margin: "0 0 8px 0",
              }}
            >
              MEND IS WITH YOU, {username.toUpperCase()} 🤍
            </p>
          )}

          {/* view-vent: Venting, Reframing, Affirmations, Grounding, Grief */}
          {currentView === "view-vent" && (
            <div className="view-section active">
              {/* Daily Affirmations Card */}
              <Affirmations onExpandGrounding={() => setGroundingOpen(true)} />

              {/* 5-4-3-2-1 Grounding Expander */}
              {groundingOpen && <GroundingPanel onClose={() => setGroundingOpen(false)} />}

              {/* Grief stage picker */}
              <GriefTracker griefStage={griefStage} onStageSelect={handleStageSelect} />

              {/* Vent / Reframe Modes Selector */}
              <div className="mode-toggle-wrap">
                <div className="mode-toggle" id="vent-mode-toggle">
                  <button
                    className={`mode-btn ${ventMode === "vent" ? "active" : ""}`}
                    onClick={() => handleToggleMode("vent")}
                  >
                    💬 Vent
                  </button>
                  <button
                    className={`mode-btn ${ventMode === "reframe" ? "active" : ""}`}
                    onClick={() => handleToggleMode("reframe")}
                  >
                    🧠 Reframe
                  </button>
                </div>
              </div>

              {/* Mode Body */}
              {ventMode === "vent" ? (
                <VentWall onVentComplete={handleGlowHeaderBar} />
              ) : (
                <ReframeJournal
                  reframes={reframes}
                  onSaveReframe={handleSaveReframe}
                  onDeleteReframe={handleDeleteReframe}
                />
              )}
            </div>
          )}

          {/* view-reality: No-Contact, Boundaries list, Panic urgetext */}
          {currentView === "view-reality" && (
            <div className="view-section active">
              <div className="section-header">
                <h2>Truths & Boundaries</h2>
                <p>What is real. What you deserve. What you are protecting.</p>
              </div>

              {/* NC Card */}
              <NCCounter
                ncStart={ncStart}
                onStartNC={handleStartNC}
                onBrokeNC={() => setNcResetOpen(true)}
              />

              {/* Reality boundaries Check card */}
              <RealityCheck
                realityChecks={realityChecks}
                onAddReality={handleAddReality}
                onDeleteReality={handleDeleteReality}
                onPanicClick={() => setPanicOpen(true)}
              />
            </div>
          )}

          {/* view-selfcare: Mood Logging, survival checklist progress */}
          {currentView === "view-selfcare" && (
            <div className="view-section active">
              <div className="section-header">
                <h2>Daily Healing</h2>
                <p>One step at a time. Your nervous system is recovering.</p>
              </div>

              {/* Mood checks */}
              <MoodTracker moodHistory={moodHistory} onSaveMood={handleSaveMood} />

              {/* Checklist */}
              <SurvivalChecklist
                selfCareItems={selfCareItems}
                customChecklistItems={customChecklistItems}
                onToggleItem={handleToggleItem}
                onAddCustomItem={handleAddCustomItem}
                onDeleteCustomItem={handleDeleteCustomItem}
              />
            </div>
          )}

          {/* view-breathing: Pulsing meditation guidelines */}
          {currentView === "view-breathing" && <BreathingGuide />}

          {/* view-future: Write letters to future / identity values rebuild */}
          {currentView === "view-future" && (
            <div className="view-section active">
              <div className="future-tabs">
                <button
                  className={`future-tab ${vaultSubTab === "letters" ? "active" : ""}`}
                  onClick={() => handleToggleVaultSub("letters")}
                >
                  📨 Letters
                </button>
                <button
                  className={`future-tab ${vaultSubTab === "identity" ? "active" : ""}`}
                  onClick={() => handleToggleVaultSub("identity")}
                >
                  🌱 Identity
                </button>
              </div>

              {vaultSubTab === "letters" ? (
                <FutureLetters
                  letters={letters}
                  onSaveLetter={handleSaveLetter}
                  onOpenLetter={handleOpenLetter}
                  onDeleteLetter={handleDeleteLetter}
                />
              ) : (
                <IdentityBoard
                  identity={identity}
                  onAddValue={handleAddValue}
                  onRemoveValue={handleRemoveValue}
                  onAddReclaim={handleAddReclaim}
                  onRemoveReclaim={handleRemoveReclaim}
                  onSaveBecoming={handleSaveBecoming}
                />
              )}
            </div>
          )}
        </main>

        {/* Bottom Nav Bar */}
        <Navigation currentView={currentView} onViewChange={handleViewChange} />
      </div>

      {/* Global Overlays */}

      {/* Onboarding Carousel (first-time users) */}
      {!onboarded && <Onboarding onComplete={handleOnboardingComplete} />}

      {/* Settings Panel */}
      <SettingsDrawer
        isOpen={settingsOpen}
        username={username}
        onClose={() => setSettingsOpen(false)}
        onUpdateUsername={handleUpdateUsername}
        onTriggerResetAll={handleTriggerResetAll}
        onImportBackup={handleImportBackup}
      />

      {/* Panic Text Urge Overlay */}
      <PanicOverlay isOpen={panicOpen} onClose={() => setPanicOpen(false)} />

      {/* Reusable Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => {
          triggerHaptic(10);
          setConfirmOpen(false);
        }}
      />

      {/* NC Reset Confirmation Overlay */}
      {ncResetOpen && (
        <div id="nc-reset-overlay" className="panic-overlay-screen" style={{ zIndex: 10300 }}>
          <div className="panic-overlay-content">
            <div className="panic-icon">💙</div>
            <h2>It's okay.</h2>
            <p>Healing isn't linear. Slipping doesn't erase your progress — it just means you're human.</p>
            <div className="panic-challenge">
              <p>Every restart is still a choice to heal. You can do this.</p>
            </div>
            <button
              id="btn-confirm-nc-reset"
              className="btn-primary"
              style={{ marginBottom: "12px" }}
              onClick={handleConfirmNCReset}
            >
              Reset & Start Again
            </button>
            <button
              id="btn-cancel-nc-reset"
              className="btn-secondary-outline"
              onClick={() => {
                triggerHaptic(10);
                setNcResetOpen(false);
              }}
            >
              Cancel — I Didn't Break It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
