import { usePomodoroContext } from '../contexts/PomodoroContext';

/**
 * Configuration management
 */
export function usePomodoroConfig() {
  const { config, updateConfig } = usePomodoroContext();

  return {
    config,
    setWorkDuration: (minutes: number) => updateConfig({ workDuration: minutes }),
    setBreakDuration: (minutes: number) => updateConfig({ breakDuration: minutes }),
    setSessionsPerCycle: (count: number) => updateConfig({ sessionsPerCycle: count }),
    updateConfig,
  };
}
