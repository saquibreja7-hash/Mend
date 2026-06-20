"use client";

import React, { useState, useEffect } from "react";
import { SelfCareItem, MoodEntry, ReframeEntry, LetterEntry, IdentityData, UrgeEntry, ProfileCheck, UnsentLetter, VoiceEntry, DashboardDay } from "@/types";
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
import LetterVault from "@/components/Vault/LetterVault";
import UrgeLog from "@/components/Truths/UrgeLog";
import ProfileCheckTracker from "@/components/Truths/ProfileCheckTracker";
import RecoveryDashboard from "@/components/Heal/RecoveryDashboard";
import VoiceDump from "@/components/VoiceDump/VoiceDump";
import Onboarding from "@/components/Onboarding";
import SettingsDrawer from "@/components/SettingsDrawer";
import ConfirmModal from "@/components/ConfirmModal";

// Utilities
import { triggerHaptic } from "@/utils/haptics";
import { safeGetItem, safeSetItem, safeRemoveItem, safeJsonParse } from "@/utils/storage";
import { clearVoiceDB } from "@/utils/voiceDB";
import { pushAllToFirestore, pullFromFirestore } from "@/utils/firebaseSync";
import { onUserChanged, handleRedirectResult } from "@/lib/firebase";
import { User } from "firebase/auth";

const MOOD_OPTIONS = [
  { id: "numb",         emoji: "😶",     label: "Numb" },
  { id: "missing",      emoji: "❤️‍🩹",   label: "Missing them" },
  { id: "angry",        emoji: "😤",     label: "Angry" },
  { id: "overthinking", emoji: "🌀",     label: "Overthinking" },
  { id: "lonely",       emoji: "🫂",     label: "Lonely" },
  { id: "hopeful",      emoji: "🌱",     label: "Hopeful" },
  { id: "okay",         emoji: "😌",     label: "Okay" },
  { id: "proud",        emoji: "💪",     label: "Proud" },
];

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
  const [currentView, setCurrentView] = useState("view-home");
  const [ventMode, setVentMode] = useState<"vent" | "reframe">("vent");
  const [vaultSubTab, setVaultSubTab] = useState<"letters" | "unsent" | "voice" | "identity">("letters");
  const [todayEmotion, setTodayEmotion] = useState<string | null>(null);

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

  // New feature state
  const [urges, setUrges] = useState<UrgeEntry[]>([]);
  const [profileChecks, setProfileChecks] = useState<ProfileCheck[]>([]);
  const [unsentLetters, setUnsentLetters] = useState<UnsentLetter[]>([]);
  const [voiceEntries, setVoiceEntries] = useState<VoiceEntry[]>([]);
  const [dashboardDay, setDashboardDay] = useState<DashboardDay>({ date: "" });

  // Auth
  const [authUser, setAuthUser] = useState<User | null>(null);

  // Custom User settings & onboarding states
  const [username, setUsername] = useState("");
  const [onboarded, setOnboarded] = useState(true);

  // UI state overlays
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [panicOpen, setPanicOpen] = useState(false);
  const [ncResetOpen, setNcResetOpen] = useState(false);
  const [healingPercentage, setHealingPercentage] = useState(0);

  // Daily intention
  const [intention, setIntention] = useState("");
  const [intentionEditing, setIntentionEditing] = useState(false);

  // Reusable confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Helper: time-of-day greeting
  const getTimeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  };

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

    // 11. Urges
    setUrges(safeJsonParse<UrgeEntry[]>(safeGetItem("mend_urges", null), []));

    // 12. Profile Checks
    setProfileChecks(safeJsonParse<ProfileCheck[]>(safeGetItem("mend_profile_checks", null), []));

    // 13. Unsent Letters
    setUnsentLetters(safeJsonParse<UnsentLetter[]>(safeGetItem("mend_unsent_letters", null), []));

    // 14. Voice Entries (metadata only; blobs live in IndexedDB)
    setVoiceEntries(safeJsonParse<VoiceEntry[]>(safeGetItem("mend_voice_entries", null), []));

    // 15. Dashboard day data
    const todayKey = `mend_dashboard_${getTodayDateString()}`;
    const savedDash = safeGetItem(todayKey, null);
    setDashboardDay(savedDash ? safeJsonParse<DashboardDay>(savedDash, { date: getTodayDateString() }) : { date: getTodayDateString() });

    // 16. Today emotion chip
    setTodayEmotion(safeGetItem(`mend_emotion_today_${getTodayDateString()}`, null));

    // 17. Daily intention
    setIntention(safeGetItem("mend_intention", "") || "");

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

  // isHydrated gates the push effect — ensures pull completes before any push fires
  const [isHydrated, setIsHydrated] = useState(false);

  // Resolve any pending Google redirect on first load
  useEffect(() => { handleRedirectResult(); }, []);

  // Subscribe to Firebase auth state + pull on every auth change.
  // Running pull here (not on mount) means it fires correctly when:
  //   - App first loads (anonymous sign-in resolves)
  //   - User upgrades to Google (new UID, cloud data must be fetched)
  useEffect(() => {
    const unsub = onUserChanged(async (user) => {
      setAuthUser(user);
      if (!user) { setIsHydrated(true); return; }

      const remote = await pullFromFirestore();
      if (remote && typeof window !== "undefined") {
        let merged = false;
        Object.entries(remote).forEach(([key, val]) => {
          if (key === "updatedAt") return;
          if (typeof val === "string" && !localStorage.getItem(key)) {
            localStorage.setItem(key, val);
            merged = true;
          }
        });
        // Reload so React state hydrates from the merged localStorage
        if (merged) { window.location.reload(); return; }
      }
      setIsHydrated(true);
    });
    return unsub;
  }, []);

  // Push all mend_ keys to Firestore on meaningful state changes.
  // Guarded by isHydrated so it never fires before pull completes.
  useEffect(() => {
    if (!isMounted || !isHydrated) return;
    const snapshot: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("mend_")) {
        snapshot[key] = localStorage.getItem(key) || "";
      }
    }
    pushAllToFirestore(snapshot);
  }, [
    isMounted,
    isHydrated,
    moodHistory,
    reframes,
    urges,
    profileChecks,
    unsentLetters,
    voiceEntries,
    letters,
    identity,
    selfCareItems,
    realityChecks,
    dashboardDay,
    ncStart,
    streak,
  ]);

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

  const handleToggleVaultSub = (tab: "letters" | "unsent" | "voice" | "identity") => {
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
    const colors = ["#ea2804", "#c01f00", "#202020", "#2b9a66", "#f59e0b", "#06b6d4"];

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
      fill.style.boxShadow = "0 0 25px #ea2804";
      setTimeout(() => {
        fill.style.boxShadow = "0 0 10px #ea2804";
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

  // Urge Log handlers
  const handleLogUrge = (category: string) => {
    triggerHaptic(20);
    const entry: UrgeEntry = { id: "urge_" + Date.now(), category, timestamp: Date.now() };
    const updated = [...urges, entry];
    setUrges(updated);
    safeSetItem("mend_urges", JSON.stringify(updated));
  };

  const handleDeleteUrge = (id: string) => {
    const updated = urges.filter((u) => u.id !== id);
    setUrges(updated);
    safeSetItem("mend_urges", JSON.stringify(updated));
  };

  // Profile Check handlers
  const handleProfileCheck = () => {
    triggerHaptic(20);
    const entry: ProfileCheck = { id: "pc_" + Date.now(), timestamp: Date.now() };
    const updated = [...profileChecks, entry];
    setProfileChecks(updated);
    safeSetItem("mend_profile_checks", JSON.stringify(updated));
  };

  // Unsent Letters handlers
  const handleSaveUnsentLetter = (text: string, category: string) => {
    triggerHaptic(25);
    const entry: UnsentLetter = { id: "ul_" + Date.now(), text, category, createdAt: Date.now() };
    const updated = [...unsentLetters, entry];
    setUnsentLetters(updated);
    safeSetItem("mend_unsent_letters", JSON.stringify(updated));
  };

  const handleDeleteUnsentLetter = (id: string) => {
    showConfirm("Delete Letter?", "Permanently delete this letter? This cannot be undone.", () => {
      const updated = unsentLetters.filter((l) => l.id !== id);
      setUnsentLetters(updated);
      safeSetItem("mend_unsent_letters", JSON.stringify(updated));
    });
  };

  // Voice Entry handlers
  const handleSaveVoiceEntry = (entry: VoiceEntry) => {
    const updated = [...voiceEntries, entry];
    setVoiceEntries(updated);
    safeSetItem("mend_voice_entries", JSON.stringify(updated));
  };

  const handleDeleteVoiceEntry = (id: string) => {
    const updated = voiceEntries.filter((e) => e.id !== id);
    setVoiceEntries(updated);
    safeSetItem("mend_voice_entries", JSON.stringify(updated));
  };

  // Dashboard day handler
  const handleUpdateDashboard = (data: Partial<DashboardDay>) => {
    const todayStr = getTodayDateString();
    const updated = { ...dashboardDay, ...data, date: todayStr };
    setDashboardDay(updated);
    safeSetItem(`mend_dashboard_${todayStr}`, JSON.stringify(updated));
  };

  // Emotion chip handler
  const handleSetEmotion = (emotion: string) => {
    triggerHaptic(15);
    const key = `mend_emotion_today_${getTodayDateString()}`;
    const next = todayEmotion === emotion ? null : emotion;
    setTodayEmotion(next);
    if (next) {
      safeSetItem(key, next);
    } else {
      safeRemoveItem(key);
    }
  };

  // Helper: today's counts for dashboard
  const getTodayCount = (items: Array<{ timestamp: number }>) => {
    const todayStr = getTodayDateString();
    return items.filter((item) => {
      const d = new Date(item.timestamp);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return ds === todayStr;
    }).length;
  };

  // Settings drawers handlers
  const handleUpdateUsername = (newName: string) => {
    setUsername(newName);
    safeSetItem("mend_username", newName);
  };

  const handleTriggerResetAll = () => {
    showConfirm(
      "Reset All Companion Data?",
      "WARNING: This will permanently wipe all logs, letters, streaks, checks, voice recordings, and settings. This cannot be undone.",
      () => {
        if (typeof window !== "undefined") {
          clearVoiceDB().catch(() => {});
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
          clearVoiceDB().catch(() => {});
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
            <p style={{ fontSize: "0.75rem", color: "#b0b0b0", letterSpacing: "2px", textTransform: "uppercase" }}>Just a moment</p>
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

          {/* ── view-home: Dashboard ── */}
          {currentView === "view-home" && (
            <div className="view-section active">

              {/* Progress Bar */}
              <div className="home-progress-wrap">
                <div className="home-progress-labels">
                  <span className="home-progress-label">Today&apos;s Healing</span>
                  <span className="home-progress-pct">{healingPercentage}%</span>
                </div>
                <div className="home-progress-track">
                  <div className="home-progress-fill" style={{ width: `${healingPercentage}%` }} />
                </div>
              </div>

              {/* Hero Quote + Landscape Illustration */}
              <div className="home-hero">
                <div className="home-hero-text">
                  <p className="home-hero-quote">
                    You&apos;re not starting over. You&apos;re choosing yourself.
                  </p>
                  <p className="home-hero-sub">
                    Good {getTimeOfDay()}{username ? `, ${username}` : ""}
                  </p>
                </div>
                {/* Sketch landscape SVG */}
                <svg className="home-hero-illo" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sky */}
                  <ellipse cx="78" cy="16" rx="12" ry="12" stroke="#1c1917" strokeWidth="1.2" fill="none" />
                  <line x1="78" y1="1" x2="78" y2="4" stroke="#1c1917" strokeWidth="1" />
                  <line x1="78" y1="28" x2="78" y2="31" stroke="#1c1917" strokeWidth="1" />
                  <line x1="63" y1="16" x2="66" y2="16" stroke="#1c1917" strokeWidth="1" />
                  <line x1="90" y1="16" x2="93" y2="16" stroke="#1c1917" strokeWidth="1" />
                  {/* Birds */}
                  <path d="M20 12 Q23 9 26 12" stroke="#1c1917" strokeWidth="1" fill="none" />
                  <path d="M30 8 Q33 5 36 8" stroke="#1c1917" strokeWidth="1" fill="none" />
                  {/* Hills */}
                  <path d="M0 65 Q25 38 50 55 Q70 68 100 45 L100 80 L0 80 Z" stroke="#1c1917" strokeWidth="1.3" fill="#ede8df" />
                  {/* Winding road */}
                  <path d="M10 80 Q30 68 45 58 Q60 48 80 52 Q90 54 100 50" stroke="#1c1917" strokeWidth="1.2" fill="none" strokeDasharray="3 2" />
                  {/* Ground line */}
                  <line x1="0" y1="80" x2="100" y2="80" stroke="#1c1917" strokeWidth="1" />
                </svg>
              </div>

              {/* Today’s Snapshot */}
              <div className="home-snapshot-card">
                <div className="home-snapshot-title">Today&apos;s Snapshot</div>
                <div className="home-snapshot-cols">
                  {/* NC Days */}
                  <div className="home-snapshot-col">
                    <svg className="home-snapshot-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="home-snapshot-num">
                      {ncStart ? Math.max(0, Math.floor((Date.now() - new Date(ncStart).getTime()) / (1000 * 60 * 60 * 24))) : 0}
                    </span>
                    <span className="home-snapshot-lbl">No-Contact{"\n"}Days</span>
                  </div>
                  {/* Mood */}
                  <div className="home-snapshot-col">
                    <svg className="home-snapshot-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                    <span className="home-snapshot-num" style={{ fontSize: "1rem", paddingTop: "4px" }}>
                      {(() => {
                        const todayEntry = moodHistory.find((m) => m.date === getTodayDateString());
                        if (!todayEntry) return "—";
                        if (todayEntry.score >= 7) return "Good";
                        if (todayEntry.score >= 4) return "Okay";
                        return "Low";
                      })()}
                    </span>
                    <span className="home-snapshot-lbl">Mood</span>
                  </div>
                  {/* Urges */}
                  <div className="home-snapshot-col">
                    <svg className="home-snapshot-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12 C2 6 6 2 12 2 C18 2 22 6 22 12" />
                      <path d="M2 12 C4 16 7 20 12 22 C17 20 20 16 22 12" />
                    </svg>
                    <span className="home-snapshot-num">{getTodayCount(urges)}</span>
                    <span className="home-snapshot-lbl">Urges{"\n"}Today</span>
                  </div>
                  {/* Profile Checks */}
                  <div className="home-snapshot-col">
                    <svg className="home-snapshot-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span className="home-snapshot-num">{getTodayCount(profileChecks)}</span>
                    <span className="home-snapshot-lbl">Profile{"\n"}Checks</span>
                  </div>
                </div>
              </div>

              {/* Where Do You Want To Go */}
              <div className="home-section">
                <p className="home-section-heading">Where do you want to go?</p>
                <div className="home-nav-tiles">
                  {/* Vent */}
                  <button className="home-nav-tile" onClick={() => handleViewChange("view-journal")}>
                    <svg className="home-nav-tile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="home-nav-tile-lbl">Vent</span>
                  </button>
                  {/* Truths */}
                  <button className="home-nav-tile" onClick={() => handleViewChange("view-profile")}>
                    <svg className="home-nav-tile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span className="home-nav-tile-lbl">Truths</span>
                  </button>
                  {/* Heal */}
                  <button className="home-nav-tile" onClick={() => handleViewChange("view-heal")}>
                    <svg className="home-nav-tile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 0 1 0 20" />
                      <path d="M12 2a10 10 0 0 0 0 20" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span className="home-nav-tile-lbl">Heal</span>
                  </button>
                  {/* Breathe */}
                  <button className="home-nav-tile" onClick={() => handleViewChange("view-heal")}>
                    <svg className="home-nav-tile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                    </svg>
                    <span className="home-nav-tile-lbl">Breathe</span>
                  </button>
                  {/* Vault */}
                  <button className="home-nav-tile" onClick={() => handleViewChange("view-library")}>
                    <svg className="home-nav-tile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="home-nav-tile-lbl">Vault</span>
                  </button>
                </div>
              </div>

              {/* Daily Intention */}
              <div className="home-intention-card">
                <div className="home-intention-inner">
                  <div className="home-intention-text-area">
                    <span className="home-intention-label">Daily Intention</span>
                    {intentionEditing ? (
                      <input
                        className="home-intention-input"
                        autoFocus
                        value={intention}
                        placeholder="Write your intention..."
                        onChange={(e) => setIntention(e.target.value)}
                        onBlur={() => {
                          setIntentionEditing(false);
                          safeSetItem("mend_intention", intention);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setIntentionEditing(false);
                            safeSetItem("mend_intention", intention);
                          }
                        }}
                      />
                    ) : intention ? (
                      <p className="home-intention-quote">{intention}</p>
                    ) : (
                      <p className="home-intention-placeholder">Set your focus for today...</p>
                    )}
                  </div>
                  {/* Plant SVG */}
                  <svg className="home-intention-illo" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Pot */}
                    <path d="M18 58 L22 72 L38 72 L42 58 Z" stroke="#1c1917" strokeWidth="1.3" fill="#ede8df" />
                    <ellipse cx="30" cy="58" rx="12" ry="3.5" stroke="#1c1917" strokeWidth="1.3" fill="#e8e0d5" />
                    {/* Stem */}
                    <path d="M30 57 C30 50 28 42 30 32" stroke="#1c1917" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                    {/* Left leaf */}
                    <path d="M30 44 C24 40 16 38 18 30 C22 32 28 36 30 44" stroke="#1c1917" strokeWidth="1.2" fill="#ede8df" />
                    {/* Right leaf */}
                    <path d="M30 38 C36 34 44 32 42 24 C38 26 32 30 30 38" stroke="#1c1917" strokeWidth="1.2" fill="#ede8df" />
                    {/* Top small leaf */}
                    <path d="M30 32 C28 26 30 20 32 18 C34 22 32 28 30 32" stroke="#1c1917" strokeWidth="1.2" fill="#ede8df" />
                  </svg>
                </div>
                <div className="home-intention-divider" />
                <div className="home-intention-footer">
                  <button
                    className="home-intention-set-btn"
                    onClick={() => setIntentionEditing(true)}
                  >
                    + {intention ? "Change intention" : "Set a new intention"}
                  </button>
                </div>
              </div>

              {/* Quick Tools */}
              <div className="home-section">
                <p className="home-section-heading">Quick Tools</p>
                <div className="home-quick-grid">
                  {/* Grounding */}
                  <button className="home-quick-card" onClick={() => { setGroundingOpen(true); handleViewChange("view-journal"); }}>
                    <div className="home-quick-card-top">
                      <svg className="home-quick-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22V12m0 0C12 7 9 4 5 4c0 4 3 7 7 8zm0 0c0-5 3-8 7-8 0 4-3 7-7 8" />
                      </svg>
                      <span className="home-quick-card-arrow">→</span>
                    </div>
                    <p className="home-quick-card-title">Grounding</p>
                    <p className="home-quick-card-sub">5-4-3-2-1</p>
                  </button>
                  {/* Urge Log */}
                  <button className="home-quick-card" onClick={() => handleViewChange("view-profile")}>
                    <div className="home-quick-card-top">
                      <svg className="home-quick-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span className="home-quick-card-arrow">→</span>
                    </div>
                    <p className="home-quick-card-title">Urge Log</p>
                    <p className="home-quick-card-sub">Track urges</p>
                  </button>
                  {/* Panic Mode */}
                  <button className="home-quick-card" onClick={() => setPanicOpen(true)}>
                    <div className="home-quick-card-top">
                      <svg className="home-quick-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                      <span className="home-quick-card-arrow">→</span>
                    </div>
                    <p className="home-quick-card-title">Panic Mode</p>
                    <p className="home-quick-card-sub">I need help</p>
                  </button>
                  {/* Journal */}
                  <button className="home-quick-card" onClick={() => handleViewChange("view-journal")}>
                    <div className="home-quick-card-top">
                      <svg className="home-quick-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      <span className="home-quick-card-arrow">→</span>
                    </div>
                    <p className="home-quick-card-title">Journal</p>
                    <p className="home-quick-card-sub">Write freely</p>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ── view-journal: Vent, Reframe, Affirmations, Grounding, Grief ── */}
          {currentView === "view-journal" && (
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

          {/* ── view-profile: Truths, NC Counter, Urge Log, Panic ── */}
          {currentView === "view-profile" && (
            <div className="view-section active">
              <div className="section-header">
                <h2>Truths & Boundaries</h2>
                <p>What is real. What you deserve. What you are protecting.</p>
              </div>

              <NCCounter
                ncStart={ncStart}
                onStartNC={handleStartNC}
                onBrokeNC={() => setNcResetOpen(true)}
              />

              <RealityCheck
                realityChecks={realityChecks}
                onAddReality={handleAddReality}
                onDeleteReality={handleDeleteReality}
                onPanicClick={() => setPanicOpen(true)}
              />

              <ProfileCheckTracker
                checks={profileChecks}
                onCheck={handleProfileCheck}
                getTodayDateString={getTodayDateString}
              />

              <UrgeLog
                urges={urges}
                onLogUrge={handleLogUrge}
                onDeleteUrge={handleDeleteUrge}
                getTodayDateString={getTodayDateString}
              />
            </div>
          )}

          {/* ── view-heal: Mood, Checklist, Breathing (merged) ── */}
          {currentView === "view-heal" && (
            <div className="view-section active">
              <div className="section-header">
                <h2>Daily Healing</h2>
                <p>One step at a time. Your nervous system is recovering.</p>
              </div>

              <RecoveryDashboard
                dashboardDay={dashboardDay}
                ncStart={ncStart}
                moodHistory={moodHistory}
                urgesCount={getTodayCount(urges)}
                profileChecksCount={getTodayCount(profileChecks)}
                onUpdateDashboard={handleUpdateDashboard}
                getTodayDateString={getTodayDateString}
              />

              <MoodTracker moodHistory={moodHistory} onSaveMood={handleSaveMood} />

              <SurvivalChecklist
                selfCareItems={selfCareItems}
                customChecklistItems={customChecklistItems}
                onToggleItem={handleToggleItem}
                onAddCustomItem={handleAddCustomItem}
                onDeleteCustomItem={handleDeleteCustomItem}
              />

              {/* Breathing guide merged into Heal */}
              <BreathingGuide />
            </div>
          )}

          {/* ── view-library: Vault — Letters, Voice, Identity ── */}
          {currentView === "view-library" && (
            <div className="view-section active">
              <div className="future-tabs">
                {(["letters", "unsent", "voice", "identity"] as const).map((tab) => {
                  const labels: Record<string, string> = {
                    letters: "📨 Future",
                    unsent: "💌 Unsent",
                    voice: "🎙️ Voice",
                    identity: "🌱 Identity",
                  };
                  return (
                    <button
                      key={tab}
                      className={`future-tab ${vaultSubTab === tab ? "active" : ""}`}
                      onClick={() => handleToggleVaultSub(tab)}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {vaultSubTab === "letters" && (
                <FutureLetters
                  letters={letters}
                  onSaveLetter={handleSaveLetter}
                  onOpenLetter={handleOpenLetter}
                  onDeleteLetter={handleDeleteLetter}
                />
              )}
              {vaultSubTab === "unsent" && (
                <LetterVault
                  letters={unsentLetters}
                  onSaveLetter={handleSaveUnsentLetter}
                  onDeleteLetter={handleDeleteUnsentLetter}
                />
              )}
              {vaultSubTab === "voice" && (
                <VoiceDump
                  entries={voiceEntries}
                  onSaveEntry={handleSaveVoiceEntry}
                  onDeleteEntry={handleDeleteVoiceEntry}
                />
              )}
              {vaultSubTab === "identity" && (
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
        authUser={authUser}
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
