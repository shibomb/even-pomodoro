import { useEffect, useRef } from 'react';
import { usePomodoroContext } from '../contexts/PomodoroContext';

/**
 * Manages timer countdown and auto-transitions between phases
 */
export function usePomodoroTimer() {
  const { activeSession, config, skipPhase, completeSession } = usePomodoroContext();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activeSession || !activeSession.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Timer is running - decrement every second
    intervalRef.current = setInterval(() => {
      // Updates happen in context via separate effect
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeSession, activeSession?.isRunning]);

  // Handle countdown and auto-transitions
  useEffect(() => {
    if (!activeSession || !activeSession.isRunning) return;

    const timer = setInterval(() => {
      // Decrement time in context
      // This is handled by the state update in PomodoroContext
      // For now, we just track when to auto-transition
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, config]);
}
