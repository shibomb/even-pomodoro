import { PomodoroConfig, AppLanguage } from '../types/pomodoro';
import { DEFAULT_CONFIG } from './pomodoroDefaults';

const CONFIG_KEY = 'even-pomodoro:config';
const SETTINGS_KEY = 'even-pomodoro:settings';

/**
 * Load user config from localStorage, or return defaults
 */
export function loadConfig(): PomodoroConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
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
 * Save config to localStorage
 */
export function saveConfig(config: PomodoroConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // silent fail
  }
}

/**
 * Load language preference
 */
export function loadLanguage(): AppLanguage {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
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
    const raw = localStorage.getItem(SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    settings.language = language;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // silent fail
  }
}
