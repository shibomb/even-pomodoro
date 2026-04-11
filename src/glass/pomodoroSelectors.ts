import { createGlassScreenRouter } from 'even-toolkit/glass-screen-router';
import { PomodoroSnapshot, PomodoroActions } from './pomodoroShared';
import { homeScreen } from './screens/home';
import { startConfigScreen } from './screens/start-config';
import { sessionScreen } from './screens/session';
import { completeScreen } from './screens/complete';

export const { toDisplayData, onGlassAction } = createGlassScreenRouter<
  PomodoroSnapshot,
  PomodoroActions
>(
  {
    home: homeScreen,
    'start-config': startConfigScreen,
    session: sessionScreen,
    complete: completeScreen,
  },
  'home'
);
