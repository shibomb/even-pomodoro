import { usePomodoroContext } from '../contexts/PomodoroContext';

/**
 * Access current session state
 */
export function usePomodoroSession() {
  const { activeSession } = usePomodoroContext();

  if (!activeSession) {
    return {
      isActive: false,
      phase: null as any,
      cycleNumber: 0,
      timeRemaining: 0,
      isRunning: false,
    };
  }

  return {
    isActive: true,
    phase: activeSession.phase,
    cycleNumber: activeSession.cycleNumber,
    timeRemaining: activeSession.timeRemaining,
    isRunning: activeSession.isRunning,
    sessionId: activeSession.sessionId,
  };
}
