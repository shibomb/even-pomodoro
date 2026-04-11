import { PomodoroConfig, AppLanguage } from '../types/pomodoro';
import { DEFAULT_CONFIG } from './pomodoroDefaults';
import { initStorage, getItem, setItem } from './bridgeStorage';

export const CONFIG_KEY = 'even-pomodoro:config';
export const SETTINGS_KEY = 'even-pomodoro:settings';

/** All storage keys this app uses — passed to initStorage for preloading. */
export const ALL_STORAGE_KEYS = [CONFIG_KEY, SETTINGS_KEY];

/**
 * Initialize persistent storage (bridge + cache).
 * Must be awaited before first render.
 */
export async function initPersistence(): Promise<void> {
  await initStorage(ALL_STORAGE_KEYS);
}

/**
 * Load user config from storage, or return defaults
 */
export function loadConfig(): PomodoroConfig {
  try {
    const raw = getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
    return DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Save config to storage
 */
export function saveConfig(config: PomodoroConfig): void {
  try {
    setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // silent fail
  }
}

/**
 * Load language preference
 */
export function loadLanguage(): AppLanguage {
  try {
    const raw = getItem(SETTINGS_KEY);
    if (raw) {
      const settings = JSON.parse(raw);
      return settings.language || 'en';
    }
  } catch {
    // silent fail
  }
  return 'en';
}

/**
 * Save language preference
 */
export function saveLanguage(language: AppLanguage): void {
  try {
    const raw = getItem(SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    settings.language = language;
    setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // silent fail
  }
}
