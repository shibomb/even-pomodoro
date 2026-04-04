import type { GlassScreen } from 'even-toolkit/glass-screen-router';
import { line } from 'even-toolkit/types';
import { PomodoroSnapshot, PomodoroActions } from '../pomodoroShared';
import { getDotNumberTwoDigits } from '../dotFontNumber';

// G2 display: ~28 chars wide, 10 lines max

function formatTime(seconds: number): string {
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/** Compute remaining seconds from phaseDeadline (running) or stored timeRemaining (paused) */
function getRemaining(snapshot: PomodoroSnapshot): number {
  const s = snapshot.activeSession;
  if (!s) return 0;
  if (s.phaseDeadline) {
    return Math.max(0, (s.phaseDeadline - Date.now()) / 1000);
  }
  return s.timeRemaining;
}

function calcPercent(snapshot: PomodoroSnapshot): number {
  const s = snapshot.activeSession;
  if (!s) return 0;
  const total = s.phase === 'work'
    ? snapshot.config.workDuration * 60
    : snapshot.config.breakDuration * 60;
  if (total === 0) return 0;
  const remaining = getRemaining(snapshot);
  return Math.round(((total - remaining) / total) * 100);
}

export const sessionScreen: GlassScreen<PomodoroSnapshot, PomodoroActions> = {
  display(snapshot: PomodoroSnapshot, nav: any) {
    if (!snapshot.activeSession) {
      return { lines: [line('[No session]')] };
    }

    const s = snapshot.activeSession;
    const remaining = getRemaining(snapshot);
    const pct = calcPercent(snapshot);
    const paused = !s.isRunning;
    const showDetail = paused || Date.now() < ((nav as any).detailUntil ?? 0);

    const phaseLabel = s.phase === 'work' ? snapshot.config.textWorking : snapshot.config.textBreaking;
    const pctStr = `${pct}%`.padStart(4);

    // Line 1: title + percentage (always visible)
    // If user sets ALWAYS SHOW DETAIL ON, show the detail line on line1 even when not explicitly detail mode.
    const rawTitle = showDetail
      ? `▉▊▋▌▍▎▏ ${phaseLabel} ${ pctStr }`
      : snapshot.config.alwaysShowDetail
        ? `${phaseLabel} ${pctStr} [${formatTime(remaining)}] (${s.cycleNumber}/${snapshot.config.sessionsPerCycle})`
        : `${phaseLabel} ${pctStr}`;

    const title = rawTitle;

    const lines = [line(title)];
    lines.push(line(``));

    // Show large countdown numbers for last 9 seconds (when running and seconds < 10)
    const isCountdown = !paused && remaining < 10;

    if (isCountdown) {
      // Display large dot-matrix numbers for countdown
      const dotLines = getDotNumberTwoDigits(remaining);
      dotLines.forEach(dotLine => {
        lines.push(line(dotLine));
      });
      // Pad remaining
      while (lines.length < 10) lines.push(line(''));
    } else if (showDetail) {
      // Detail line: WORKING 53% [12:34] (2/4)
      lines.push(line(`${phaseLabel} ${pctStr} [${formatTime(getRemaining(snapshot))}] (${s.cycleNumber}/${snapshot.config.sessionsPerCycle})`));
      lines.push(line(paused ? `PAUSED` : ``));

      if (paused) {
        // Pad then show controls
        while (lines.length < 9) lines.push(line(''));
        lines.push(line('[CLICK]Resume [x2]Finish'));
      } else {
        // Pad to 10 lines
        while (lines.length < 10) lines.push(line(''));
      }
    } else {
      if (paused) {
        // Pad then show controls
        while (lines.length < 9) lines.push(line(''));
        lines.push(line('[CLICK]Resume [x2]Finish'));
      } else {
        // Pad to 10 lines
        while (lines.length < 10) lines.push(line(''));
      }
    }

    return { lines };
  },

  action(action, nav, snapshot: PomodoroSnapshot, ctx: PomodoroActions) {
    if (!snapshot.activeSession) return nav;

    const paused = !snapshot.activeSession.isRunning;

    if (action.type === 'SELECT_HIGHLIGHTED') {
      if (paused) {
        // Click while paused → resume
        ctx.resumeSession();
      } else {
        // Click while running → show detail for 5 seconds
        return { ...nav, detailUntil: Date.now() + 5000 };
      }
    } else if (action.type === 'GO_BACK') {
      if (paused) {
        // Double-tap while paused → finish (navigation handled by PomodoroGlasses)
        ctx.completeSession();
      } else {
        // Double-tap while running → pause
        ctx.pauseSession();
      }
    }

    return nav;
  },
};
