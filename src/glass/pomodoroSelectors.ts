import { createGlassScreenRouter } from 'even-toolkit/glass-screen-router';
import { PomodoroSnapshot, PomodoroActions } from './pomodoroShared';
import { startConfigScreen } from './screens/start-config';
import { sessionScreen } from './screens/session';
import { completeScreen } from './screens/complete';

export const { toDisplayData, onGlassAction } = createGlassScreenRouter<
  PomodoroSnapshot,
  PomodoroActions
>(
  {
    'start-config': startConfigScreen,
    session: sessionScreen,
    complete: completeScreen,
  },
  'start-config'
);
