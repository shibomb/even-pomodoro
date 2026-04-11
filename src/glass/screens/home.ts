import type { GlassScreen } from 'even-toolkit/glass-screen-router';
import { line } from 'even-toolkit/types';
import { PomodoroSnapshot, PomodoroActions } from '../pomodoroShared';

type HomeItem = 'start' | 'config';

const ITEMS: HomeItem[] = ['start', 'config'];

function selectedIndex(snapshot: PomodoroSnapshot): number {
  return snapshot.focusedField === 'start' || !snapshot.focusedField ? 0 : 1;
}

export const homeScreen: GlassScreen<PomodoroSnapshot, PomodoroActions> = {
  display(snapshot: PomodoroSnapshot) {
    const sel = selectedIndex(snapshot);

    const { config } = snapshot;
    const lines = [
      line('▉▊▋▌▍▎▏ POMODORO TIMER'),
      line(''),
      line(`${config.textWork} ${config.workDuration}min`),
      line(`${config.textBreak} ${config.breakDuration}min`),
      line(`${config.textCycle} ${config.sessionsPerCycle}`),
      line(''),
      line(`${sel === 0 ? '☞ ' : '　 '}[START]`),
      line(`${sel === 1 ? '☞ ' : '　 '}[CONFIG]`),
    ];

    while (lines.length < 9) lines.push(line(''));
    lines.push(line('[↑↓]Select [CLICK]OK [x2]Exit'));

    return { lines };
  },

  action(action, nav, snapshot: PomodoroSnapshot, ctx: PomodoroActions) {
    const sel = selectedIndex(snapshot);

    if (action.type === 'HIGHLIGHT_MOVE') {
      const next = action.direction === 'up' ? 0 : 1;
      // Use focusedField to track selection: null/'start' = START, anything else = CONFIG
      ctx.setFocusedField(ITEMS[next] === 'start' ? 'start' : 'cycles');
    } else if (action.type === 'SELECT_HIGHLIGHTED') {
      if (sel === 0) {
        // START → start session with current config
        ctx.setFocusedField(null);
        ctx.startSession(snapshot.config);
      } else {
        // CONFIG → navigate to config screen
        ctx.setFocusedField('workDuration');
        ctx.navigate('/config');
      }
    }
    // GO_BACK is handled by toolkit's shutdown (getPageMode = 'home')

    return nav;
  },
};
