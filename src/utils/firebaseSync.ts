"use client";

import { db, ensureAuth } from "@/lib/firebase";
import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore";

// ── Push all mend_ localStorage keys to Firestore ────────────────────────

export async function pushAllToFirestore(data: Record<string, string>) {
  try {
    const uid = await ensureAuth();
    const batch = writeBatch(db);
    const ref = doc(db, "users", uid, "snapshot", "latest");
    batch.set(ref, { ...data, updatedAt: Date.now() });
    await batch.commit();
  } catch {
    // Firestore unavailable — localStorage is the fallback, no crash
  }
}

// ── Pull snapshot from Firestore (used on fresh device / after reinstall) ─

export async function pullFromFirestore(): Promise<Record<string, string> | null> {
  try {
    const uid = await ensureAuth();
    const snap = await getDoc(doc(db, "users", uid, "snapshot", "latest"));
    if (!snap.exists()) return null;
    const data = snap.data() as Record<string, string>;
    return data;
  } catch {
    return null;
  }
}
