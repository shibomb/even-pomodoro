import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useGlasses } from 'even-toolkit/useGlasses';
import { createScreenMapper } from 'even-toolkit/glass-router';
import { usePomodoroContext } from '../contexts/PomodoroContext';
import { PomodoroSnapshot, PomodoroActions } from './pomodoroShared';
import { toDisplayData, onGlassAction as onGAAction } from './pomodoroSelectors';

export function PomodoroGlasses() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeSession,
    config,
    focusedField,
    language,
    pauseSession,
    resumeSession,
    skipPhase,
    completeSession,
    clearSession,
    transitionIfExpired,
    startSession,
    updateConfig,
    setFocusedField,
  } = usePomodoroContext();

  // ── Central navigation controller (Glass-primary) ──
  // All screen transitions are driven from here based on state changes.
  // Web screens and glass screens only update state — never navigate directly.

  const prevSessionIdRef = useRef<string | null>(null);
  const prevFinishedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const sessionId = activeSession?.sessionId ?? null;
    const finishedAt = activeSession?.finishedAt ?? null;
    const prevSessionId = prevSessionIdRef.current;
    const prevFinishedAt = prevFinishedAtRef.current;

    if (sessionId && sessionId !== prevSessionId && !finishedAt) {
      // Session started → navigate to session screen
      navigate(`/session/${sessionId}`);
    } else if (finishedAt && finishedAt !== prevFinishedAt && sessionId) {
      // Session completed → navigate to complete screen
      navigate(`/session/${sessionId}/complete`, { replace: true });
    } else if (!sessionId && prevSessionId) {
      // Session cleared → navigate to home
      navigate('/', { replace: true });
    }

    prevSessionIdRef.current = sessionId;
    prevFinishedAtRef.current = finishedAt;
  }, [activeSession?.sessionId, activeSession?.finishedAt, navigate]);

  // ── Glass-side timer expiry check ──
  // Independent of PomodoroContext's timer — ensures phase transitions
  // happen even if the web-side setInterval is throttled
  useEffect(() => {
    if (!activeSession?.isRunning || !activeSession?.phaseDeadline) return;

    const interval = setInterval(() => {
      transitionIfExpired();
    }, 200);
    transitionIfExpired();

    return () => clearInterval(interval);
  }, [activeSession?.isRunning, activeSession?.phaseDeadline, transitionIfExpired]);

  // Map URL patterns to glass screens
  const deriveScreen = createScreenMapper(
    [
      { pattern: '/', screen: 'start-config' },
      { pattern: /^\/session\/[^/]+$/, screen: 'session' },
      { pattern: /^\/session\/[^/]+\/complete$/, screen: 'complete' },
    ],
    'start-config'
  );

  // Create immutable snapshot of current state for glass
  const snapshot: PomodoroSnapshot = {
    activeSession,
    config,
    focusedField,
    language,
  };

  // Create action context for side effects
  const ctxRef = useRef<PomodoroActions>({
    navigate: (path: string) => {
      navigate(path);
    },
    startSession,
    pauseSession,
    resumeSession,
    skipPhase,
    completeSession,
    clearSession,
    transitionIfExpired,
    updateConfig,
    setFocusedField,
  });

  // Keep ctxRef in sync
  ctxRef.current = {
    navigate: (path: string) => {
      navigate(path);
    },
    startSession,
    pauseSession,
    resumeSession,
    skipPhase,
    completeSession,
    clearSession,
    transitionIfExpired,
    updateConfig,
    setFocusedField,
  };

  // Hook into glass device
  useGlasses({
    getSnapshot: () => snapshot,
    toDisplayData: (snap, nav) => toDisplayData(snap, nav),
    onGlassAction: (action, nav, snap) =>
      onGAAction(action, nav, snap, ctxRef.current),
    deriveScreen: (path: string) => deriveScreen(path),
    appName: 'POMODO',
  });

  return null;
}
