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

  // Countdown timer: decrement timeRemaining every 0.1s when running
  // Handles phase transitions (work→break→work→...→complete) automatically
  useEffect(() => {
    if (!activeSession || !activeSession.isRunning) return;

    const interval = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev || !prev.isRunning) return prev;
        const next = Math.round((prev.timeRemaining - 0.1) * 10) / 10;
        if (next > 0) {
          return { ...prev, timeRemaining: next };
        }
        // Time's up — transition to next phase
        if (prev.phase === 'work') {
          return {
            ...prev,
            phase: 'break' as const,
            timeRemaining: config.breakDuration * 60,
          };
        }
        // Break ended
        if (prev.cycleNumber >= config.sessionsPerCycle) {
          // All cycles done
          return { ...prev, timeRemaining: 0, isRunning: false, finishedAt: Date.now() };
        }
        // Next work cycle
        return {
          ...prev,
          phase: 'work' as const,
          cycleNumber: prev.cycleNumber + 1,
          timeRemaining: config.workDuration * 60,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeSession?.isRunning, activeSession?.phase, activeSession?.cycleNumber, config]);

  const startSession = useCallback((cfg: PomodoroConfig) => {
    const sessionId = `session-${Date.now()}`;
    const totalSeconds = (cfg.workDuration + cfg.breakDuration) * 60 * cfg.sessionsPerCycle;

    setActiveSession({
      sessionId,
      phase: 'work',
      cycleNumber: 1,
      timeRemaining: cfg.workDuration * 60,
      totalTimeRemaining: totalSeconds,
      startedAt: Date.now(),
      isRunning: true,
      finishedAt: null,
    });
  }, []);

  const pauseSession = useCallback(() => {
    setActiveSession((prev) => (prev ? { ...prev, isRunning: false } : null));
  }, []);

  const resumeSession = useCallback(() => {
    setActiveSession((prev) => (prev ? { ...prev, isRunning: true } : null));
  }, []);

  const skipPhase = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev) return null;

      const { phase, cycleNumber } = prev;
      const cfg = config;

      if (phase === 'work') {
        return {
          ...prev,
          phase: 'break' as const,
          timeRemaining: cfg.breakDuration * 60,
        };
      } else {
        if (cycleNumber >= cfg.sessionsPerCycle) {
          return { ...prev, isRunning: false, finishedAt: Date.now() };
        } else {
          return {
            ...prev,
            phase: 'work' as const,
            cycleNumber: cycleNumber + 1,
            timeRemaining: cfg.workDuration * 60,
          };
        }
      }
    });
  }, [config]);

  const completeSession = useCallback(() => {
    setActiveSession((prev) => (prev ? { ...prev, isRunning: false, finishedAt: Date.now() } : null));
  }, []);

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
