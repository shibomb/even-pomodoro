import { createGlassScreenRouter } from 'even-toolkit/glass-screen-router';
import { PomodoroSnapshot, PomodoroActions } from './pomodoroShared';
import { homeScreen } from './screens/home';
import { configScreen } from './screens/config';
import { sessionScreen } from './screens/session';
import { completeScreen } from './screens/complete';

export const { toDisplayData, onGlassAction } = createGlassScreenRouter<
  PomodoroSnapshot,
  PomodoroActions
>(
  {
    home: homeScreen,
    config: configScreen,
    session: sessionScreen,
    complete: completeScreen,
  },
  'home'
);
