import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  PomodoroConfig,
  ActivePomodoroSession,
  AppLanguage,
  ConfigField,
} from '../types/pomodoro';
import {
  loadConfig,
  saveConfig,
  loadLanguage,
  saveLanguage,
} from '../data/pomodoroPersistence';

interface PomodoroContextValue {
  // State
  activeSession: ActivePomodoroSession | null;
  config: PomodoroConfig;
  language: AppLanguage;
  focusedField: ConfigField;

  // Session actions
  startSession: (config: PomodoroConfig) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  skipPhase: () => void;
  completeSession: () => void;
  clearSession: () => void;
  /** Check if phaseDeadline has passed and transition phases. Safe to call repeatedly. */
  transitionIfExpired: () => void;

  // Config actions
  updateConfig: (partial: Partial<PomodoroConfig>) => void;

  // Focus tracking for glass
  setFocusedField: (field: ConfigField) => void;

  // Language
  setLanguage: (language: AppLanguage) => void;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<PomodoroConfig>(() => loadConfig());
  const [activeSession, setActiveSession] = useState<ActivePomodoroSession | null>(null);
  const [language, setLanguageState] = useState<AppLanguage>(() => loadLanguage());
  const [focusedField, setFocusedField] = useState<ConfigField>(null);

  // Persist config changes
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // Persist language changes
  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  // Countdown timer: compute timeRemaining from phaseDeadline (timestamp-based)
  // This ensures accuracy even when the app is backgrounded and setInterval is throttled
  useEffect(() => {
    if (!activeSession || !activeSession.isRunning) return;

    const tick = () => {
      setActiveSession((prev) => {
        if (!prev || !prev.isRunning || !prev.phaseDeadline) return prev;
        const now = Date.now();
        const remaining = Math.max(0, (prev.phaseDeadline - now) / 1000);

        if (remaining > 0) {
          return { ...prev, timeRemaining: Math.round(remaining * 10) / 10 };
        }
        // Time's up — transition to next phase
        if (prev.phase === 'work') {
          const breakSeconds = config.breakDuration * 60;
          return {
            ...prev,
            phase: 'break' as const,
            timeRemaining: breakSeconds,
            phaseDeadline: now + breakSeconds * 1000,
          };
        }
        // Break ended
        if (prev.cycleNumber >= config.sessionsPerCycle) {
          // All cycles done
          return { ...prev, timeRemaining: 0, isRunning: false, finishedAt: now, phaseDeadline: null };
        }
        // Next work cycle
        const workSeconds = config.workDuration * 60;
        return {
          ...prev,
          phase: 'work' as const,
          cycleNumber: prev.cycleNumber + 1,
          timeRemaining: workSeconds,
          phaseDeadline: now + workSeconds * 1000,
        };
      });
    };

    const interval = setInterval(tick, 100);
    // Run immediately on resume/foreground to catch up
    tick();

    return () => clearInterval(interval);
  }, [activeSession?.isRunning, activeSession?.phase, activeSession?.cycleNumber, config]);

  const startSession = useCallback((cfg: PomodoroConfig) => {
    const sessionId = `session-${Date.now()}`;
    const now = Date.now();
    const totalSeconds = (cfg.workDuration + cfg.breakDuration) * 60 * cfg.sessionsPerCycle;
    const workSeconds = cfg.workDuration * 60;

    setActiveSession({
      sessionId,
      phase: 'work',
      cycleNumber: 1,
      timeRemaining: workSeconds,
      totalTimeRemaining: totalSeconds,
      startedAt: now,
      isRunning: true,
      finishedAt: null,
      phaseDeadline: now + workSeconds * 1000,
    });
  }, []);

  const pauseSession = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev) return null;
      // Snapshot remaining time from deadline, clear deadline
      const remaining = prev.phaseDeadline
        ? Math.max(0, (prev.phaseDeadline - Date.now()) / 1000)
        : prev.timeRemaining;
      return { ...prev, isRunning: false, timeRemaining: remaining, phaseDeadline: null };
    });
  }, []);

  const resumeSession = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev) return null;
      // Set new deadline from stored timeRemaining
      return {
        ...prev,
        isRunning: true,
        phaseDeadline: Date.now() + prev.timeRemaining * 1000,
      };
    });
  }, []);

  const skipPhase = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev) return null;

      const { phase, cycleNumber } = prev;
      const cfg = config;
      const now = Date.now();

      if (phase === 'work') {
        const breakSeconds = cfg.breakDuration * 60;
        return {
          ...prev,
          phase: 'break' as const,
          timeRemaining: breakSeconds,
          phaseDeadline: prev.isRunning ? now + breakSeconds * 1000 : null,
        };
      } else {
        if (cycleNumber >= cfg.sessionsPerCycle) {
          return { ...prev, isRunning: false, finishedAt: now, phaseDeadline: null };
        } else {
          const workSeconds = cfg.workDuration * 60;
          return {
            ...prev,
            phase: 'work' as const,
            cycleNumber: cycleNumber + 1,
            timeRemaining: workSeconds,
            phaseDeadline: prev.isRunning ? now + workSeconds * 1000 : null,
          };
        }
      }
    });
  }, [config]);

  const completeSession = useCallback(() => {
    setActiveSession((prev) => (prev ? { ...prev, isRunning: false, finishedAt: Date.now(), phaseDeadline: null } : null));
  }, []);

  const clearSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  // Safe to call repeatedly — only transitions if phaseDeadline has actually passed
  const transitionIfExpired = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev || !prev.isRunning || !prev.phaseDeadline) return prev;
      const now = Date.now();
      const remaining = (prev.phaseDeadline - now) / 1000;
      if (remaining > 0) return prev;

      // Phase expired — transition
      if (prev.phase === 'work') {
        const breakSeconds = config.breakDuration * 60;
        return {
          ...prev,
          phase: 'break' as const,
          timeRemaining: breakSeconds,
          phaseDeadline: now + breakSeconds * 1000,
        };
      }
      // Break ended
      if (prev.cycleNumber >= config.sessionsPerCycle) {
        return { ...prev, timeRemaining: 0, isRunning: false, finishedAt: now, phaseDeadline: null };
      }
      // Next work cycle
      const workSeconds = config.workDuration * 60;
      return {
        ...prev,
        phase: 'work' as const,
        cycleNumber: prev.cycleNumber + 1,
        timeRemaining: workSeconds,
        phaseDeadline: now + workSeconds * 1000,
      };
    });
  }, [config]);

  const updateConfig = useCallback((partial: Partial<PomodoroConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
  }, []);

  const value: PomodoroContextValue = {
    activeSession,
    config,
    language,
    focusedField,
    startSession,
    pauseSession,
    resumeSession,
    skipPhase,
    completeSession,
    clearSession,
    transitionIfExpired,
    updateConfig,
    setFocusedField,
    setLanguage,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroContext(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error('usePomodoroContext must be used within PomodoroProvider');
  }
  return ctx;
}
