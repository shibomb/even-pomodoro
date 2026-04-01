export type PomodoroPhase = 'work' | 'break';
export type AppLanguage = 'en' | 'ja';
export type ConfigField = 'workDuration' | 'breakDuration' | 'cycles' | 'start' | null;

/**
 * User-configurable settings for pomodoro sessions
 */
export interface PomodoroConfig {
  workDuration: number;      // minutes
  breakDuration: number;     // minutes
  sessionsPerCycle: number;  // number of cycles
  autoStartBreak: boolean;
  autoStartWork: boolean;
  alwaysShowDetail: boolean;
}

/**
 * Active pomodoro session state (in-memory)
 */
export interface ActivePomodoroSession {
  sessionId: string;
  phase: PomodoroPhase;
  cycleNumber: number;       // 1-indexed
  timeRemaining: number;     // seconds (computed from phaseDeadline when running)
  totalTimeRemaining: number; // total for session
  startedAt: number;         // timestamp ms
  isRunning: boolean;
  finishedAt: number | null; // timestamp ms when completed
  phaseDeadline: number | null; // timestamp ms when current phase ends (null when paused)
}

/**
 * Immutable snapshot of app state for glass displays
 */
export interface PomodoroSnapshot {
  activeSession: ActivePomodoroSession | null;
  config: PomodoroConfig;
  focusedField: ConfigField;
  language: AppLanguage;
  _tick?: number; // Internal: used to trigger glass refresh on interval
}

/**
 * Side-effect context for glass module actions
 */
export interface PomodoroActions {
  navigate: (path: string) => void;
  startSession: (config: PomodoroConfig) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  skipPhase: () => void;
  completeSession: () => void;
  /** Clear the active session (return to home). */
  clearSession: () => void;
  /** Check if phaseDeadline has passed and transition phases. Safe to call repeatedly. */
  transitionIfExpired: () => void;
  updateConfig: (partial: Partial<PomodoroConfig>) => void;
  setFocusedField: (field: ConfigField) => void;
}
