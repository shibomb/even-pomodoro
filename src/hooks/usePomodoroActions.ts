import { usePomodoroContext } from '../contexts/PomodoroContext';

/**
 * Session control actions
 */
export function usePomodoroActions() {
  const { pauseSession, resumeSession, skipPhase, completeSession } = usePomodoroContext();

  return {
    pauseSession,
    resumeSession,
    skipPhase,
    completeSession,
  };
}
