import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useGlasses } from 'even-toolkit/useGlasses';
import { createScreenMapper } from 'even-toolkit/glass-router';
import { usePomodoroContext } from '../contexts/PomodoroContext';
import { PomodoroSnapshot, PomodoroActions } from './pomodoroShared';
import { toDisplayData, onGlassAction as onGAAction } from './pomodoroSelectors';
import { useClockOverlay } from './useClockOverlay';

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

  // ── Force Glass display refresh even when Web is backgrounded ──
  // When Web bg-throttles its setInterval, we need Glass to independently
  // trigger display updates via snapshot re-creation
  const [tick, setTick] = useState(0);

  // Trigger glass screen refresh at regular interval (100ms)
  // This ensures glass gets updates even if web is backgrounded
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

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

  // ── Force Glass display refresh even when Web is backgrounded ──
  // Use a shorter interval on glass side to ensure updates reach the device
  // even if web-side setInterval is throttled
  useEffect(() => {
    if (!activeSession?.isRunning) return;

    // Trigger transitionIfExpired and ensure glass device sees updates
    // even if web state isn't changing (display calls Date.now() directly)
    const interval = setInterval(() => {
      transitionIfExpired();
    }, 100);  // Shorter interval than before
    transitionIfExpired();

    return () => clearInterval(interval);
  }, [activeSession?.isRunning, transitionIfExpired]);

  // Clock overlay on glass (separate text container at top-right)
  useClockOverlay(config.showClock);

  // Map URL patterns to glass screens
  const deriveScreen = createScreenMapper(
    [
      { pattern: '/', screen: 'home' },
      { pattern: '/config', screen: 'config' },
      { pattern: /^\/session\/[^/]+$/, screen: 'session' },
      { pattern: /^\/session\/[^/]+\/complete$/, screen: 'complete' },
    ],
    'home'
  );

  // Create immutable snapshot of current state for glass
  // Include tick to force snapshot re-creation even when state doesn't change
  const snapshot: PomodoroSnapshot = {
    activeSession,
    config,
    focusedField,
    language,
    _tick: tick, // Include tick to ensure snapshot updates trigger glass refresh
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
    getPageMode: (screen: string) => screen === 'home' ? 'home' : 'text',
  });

  return null;
}
