/**
 * Bridge-aware persistent storage for Even G2 glasses.
 *
 * Browser localStorage does NOT survive app restarts inside the .ehpk WebView.
 * This module uses bridge.setLocalStorage / bridge.getLocalStorage when running
 * on the glasses, with an in-memory cache for synchronous reads.
 * Falls back to plain localStorage in the browser/simulator.
 */

type EvenBridge = {
  setLocalStorage(key: string, value: string): Promise<boolean>;
  getLocalStorage(key: string): Promise<string>;
};

const cache = new Map<string, string>();
let bridge: EvenBridge | null = null;
let initialized = false;

function getBridge(): EvenBridge | null {
  if (bridge) return bridge;
  const hub = (window as any).__evenBridge;
  if (hub?.setLocalStorage && hub?.getLocalStorage) {
    bridge = hub as EvenBridge;
    return bridge;
  }
  return null;
}

/**
 * Initialize storage: preload all known keys from bridge into the in-memory cache.
 * Must be called (and awaited) before first render so that synchronous reads work.
 * Safe to call multiple times — only runs once.
 */
export async function initStorage(keys: string[]): Promise<void> {
  if (initialized) return;
  initialized = true;

  const b = getBridge();
  if (!b) {
    // No bridge — running in browser; seed cache from localStorage
    for (const key of keys) {
      try {
        const v = localStorage.getItem(key);
        if (v) cache.set(key, v);
      } catch { /* ignore */ }
    }
    return;
  }

  // Bridge available — load from persistent bridge storage
  await Promise.all(
    keys.map(async (key) => {
      try {
        const value = await b.getLocalStorage(key);
        if (value) cache.set(key, value);
      } catch { /* ignore */ }
    }),
  );
}

/** Synchronous read from in-memory cache. */
export function getItem(key: string): string | null {
  return cache.get(key) ?? null;
}

/** Write-through: update cache immediately, persist in background. */
export function setItem(key: string, value: string): void {
  cache.set(key, value);

  const b = getBridge();
  if (b) {
    void b.setLocalStorage(key, value).catch(() => {});
  }

  // Also write to localStorage as fallback (useful in simulator)
  try {
    localStorage.setItem(key, value);
  } catch { /* ignore */ }
}
