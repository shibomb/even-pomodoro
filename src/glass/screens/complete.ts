import type { GlassScreen } from 'even-toolkit/glass-screen-router';
import { line, separator } from 'even-toolkit/types';
import { PomodoroSnapshot, PomodoroActions } from '../pomodoroShared';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hrs ${mins} min`;
  }
  return `${mins} min`;
}

export const completeScreen: GlassScreen<PomodoroSnapshot, PomodoroActions> = {
  display(snapshot: PomodoroSnapshot) {
    if (!snapshot.activeSession) {
      return { lines: [line('[No session]')] };
    }

    const session = snapshot.activeSession;
    if (!session.finishedAt) {
      return { lines: [line('[Session not finished]')] };
    }

    const duration = session.finishedAt - session.startedAt;
    const cycles = session.cycleNumber;
    const target = snapshot.config.sessionsPerCycle;

    const lines = [
        line(`▉▊▋▌▍▎▏ ${snapshot.config.textGreatWork}`),
        line(''),
        line(`Cycles: ${cycles}/${target}`),
        line(`Time:   ${formatDuration(duration)}`),
        line('')
    ]

    while (lines.length < 9) lines.push(line(''));
    lines.push(line('[CLICK]:Home'))

    return {
      lines: lines
    };
  },

  action(action, nav, _snapshot: PomodoroSnapshot, ctx: PomodoroActions) {
    if (action.type === 'SELECT_HIGHLIGHTED' || action.type === 'GO_BACK') {
      // Clear session → PomodoroGlasses navigates to home
      ctx.clearSession();
    }
    return nav;
  },
};
