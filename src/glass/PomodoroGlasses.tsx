import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { useGlasses } from 'even-toolkit/useGlasses';
import { createScreenMapper } from 'even-toolkit/glass-router';
import { usePomodoroContext } from '../contexts/PomodoroContext';
import { PomodoroSnapshot, PomodoroActions } from './pomodoroShared';
import { toDisplayData, onGlassAction as onGAAction } from './pomodoroSelectors';

export function PomodoroGlasses() {
  const navigate = useNavigate();
  const {
    activeSession,
    config,
    focusedField,
    language,
    pauseSession,
    resumeSession,
    skipPhase,
    completeSession,
    startSession,
    updateConfig,
    setFocusedField,
  } = usePomodoroContext();

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
