"use client";

import React, { useState, useRef, useEffect } from "react";
import { triggerHaptic } from "@/utils/haptics";
import { signInWithGoogle, signOut } from "@/lib/firebase";

interface AuthUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

interface SettingsDrawerProps {
  isOpen: boolean;
  username: string;
  authUser: AuthUser | null;
  onClose: () => void;
  onUpdateUsername: (newName: string) => void;
  onTriggerResetAll: () => void;
  onImportBackup: (backupData: Record<string, string>) => void;
}

export default function SettingsDrawer({
  isOpen,
  username,
  authUser,
  onClose,
  onUpdateUsername,
  onImportBackup,
  onTriggerResetAll,
}: SettingsDrawerProps) {
  const [localName, setLocalName] = useState(username);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalName(username);
  }, [username]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    triggerHaptic(15);
    setAuthLoading(true);
    setAuthError("");
    try {
      await signInWithGoogle();
    } catch {
      setAuthError("Sign-in failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    triggerHaptic(15);
    setAuthLoading(true);
    try {
      await signOut();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveName = () => {
    triggerHaptic(15);
    onUpdateUsername(localName.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExport = () => {
    triggerHaptic(20);
    try {
      const backup: Record<string, string> = {};
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("mend_")) {
          const val = localStorage.getItem(key);
          if (val !== null) backup[key] = val;
        }
      });
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mend-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export backup:", err);
    }
  };

  const handleImportClick = () => {
    triggerHaptic(10);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        const hasMendKeys = Object.keys(data).some((k) => k.startsWith("mend_"));
        if (!hasMendKeys) {
          setImportError("Invalid backup file. No Mend data found.");
          return;
        }
        setImportError("");
        triggerHaptic(40);
        onImportBackup(data);
      } catch {
        setImportError("Failed to parse JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="settings-backdrop"
        onClick={() => { triggerHaptic(10); onClose(); }}
      />

      {/* Bottom Sheet */}
      <div className="settings-sheet">
        {/* Drag handle */}
        <div className="settings-handle" />

        {/* Header */}
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button
            className="settings-close-btn"
            onClick={() => { triggerHaptic(10); onClose(); }}
            aria-label="Close settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="settings-body">

          {/* ── Account ── */}
          <div className="settings-section">
            <p className="settings-section-label">Account</p>
            {authUser && !authUser.isAnonymous ? (
              <div className="settings-account-row">
                {authUser.photoURL && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={authUser.photoURL} alt="avatar" width={40} height={40} className="settings-avatar" />
                )}
                <div className="settings-account-info">
                  <span className="settings-account-name">{authUser.displayName || "Google User"}</span>
                  <span className="settings-account-email">{authUser.email}</span>
                  <span className="settings-sync-badge">✓ Syncing to Google</span>
                </div>
                <button className="settings-action-btn" onClick={handleSignOut} disabled={authLoading}>
                  {authLoading ? "…" : "Sign out"}
                </button>
              </div>
            ) : (
              <div className="settings-google-wrap">
                <p className="settings-section-desc">Sign in to sync your data across devices and keep a secure cloud backup.</p>
                <button
                  className="settings-google-btn"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  {authLoading ? "Signing in…" : "Continue with Google"}
                </button>
                {authError && <p className="settings-error">{authError}</p>}
              </div>
            )}
          </div>

          {/* ── Personalization ── */}
          <div className="settings-section">
            <p className="settings-section-label">Personalization</p>
            <p className="settings-section-desc">Customize how your companion addresses you.</p>
            <div className="settings-input-row">
              <input
                type="text"
                placeholder="Your name…"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                className="settings-text-input"
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <button className="settings-save-btn" onClick={handleSaveName}>
                Save
              </button>
            </div>
            {saveSuccess && <p className="settings-success">✓ Name updated</p>}
          </div>

          {/* ── Backup & Sync ── */}
          <div className="settings-section">
            <p className="settings-section-label">Backup & Sync</p>
            <p className="settings-section-desc">Export your data to a local file, or restore from a backup.</p>
            <div className="settings-btn-row">
              <button className="settings-action-btn settings-action-btn--full" onClick={handleExport}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export JSON
              </button>
              <button className="settings-action-btn settings-action-btn--full" onClick={handleImportClick}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Import Backup
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: "none" }} />
            {importError && <p className="settings-error">⚠ {importError}</p>}
          </div>

          {/* ── Crisis Support ── */}
          <div className="settings-section settings-section--crisis">
            <p className="settings-section-label settings-section-label--crisis">🆘 Immediate Crisis Support</p>
            <p className="settings-section-desc">If you&apos;re experiencing extreme distress or thoughts of self-harm, help is free, confidential, and available 24/7.</p>
            <div className="settings-crisis-btns">
              <a href="tel:988" className="settings-crisis-call" onClick={() => triggerHaptic(10)}>
                📞 Call or Text 988 (US/Canada)
              </a>
              <a href="https://www.crisistextline.org/" target="_blank" rel="noreferrer" className="settings-crisis-text" onClick={() => triggerHaptic(10)}>
                💬 Text HOME to 741741 (Textline)
              </a>
            </div>
          </div>

          {/* ── Danger Zone ── */}
          <div className="settings-section settings-section--danger">
            <p className="settings-section-label settings-section-label--danger">Danger Zone</p>
            <p className="settings-section-desc">Permanently erase all journals, letters, streaks, and settings.</p>
            <button className="settings-danger-btn" onClick={onTriggerResetAll}>
              Delete All My Data
            </button>
          </div>

          {/* Bottom safe-area spacer */}
          <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
        </div>
      </div>
    </>
  );
}
