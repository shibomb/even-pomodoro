import { PomodoroConfig } from '../types/pomodoro';

export const DEFAULT_CONFIG: PomodoroConfig = {
  workDuration: 25,
  breakDuration: 5,
  sessionsPerCycle: 4,
  autoStartBreak: true,
  autoStartWork: false,
};
