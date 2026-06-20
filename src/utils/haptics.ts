export function triggerHaptic(duration = 15) {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      console.warn("Haptic feedback error:", e);
    }
  }
}
