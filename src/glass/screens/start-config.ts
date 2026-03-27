import type { GlassScreen } from 'even-toolkit/glass-screen-router';
import { line } from 'even-toolkit/types';
import { PomodoroSnapshot, PomodoroActions } from '../pomodoroShared';
import type { ConfigField } from '../../types/pomodoro';

// G2 display: ~28 chars wide, 10 lines max

// ── Row definitions ──

type RowDef =
  | { type: 'field'; field: 'workDuration' | 'breakDuration' | 'cycles'; label: string; unit: string }
  | { type: 'action'; field: 'start'; label: string };

const ROWS: RowDef[] = [
  { type: 'field',  field: 'workDuration',  label: 'WORK ',  unit: 'min.' },
  { type: 'field',  field: 'breakDuration', label: 'BREAK', unit: 'min.' },
  { type: 'field',  field: 'cycles',        label: 'CYCLE', unit: 'times' },
  { type: 'action', field: 'start',         label: '[START]' },
];

function fieldRange(field: string): { min: number; max: number } {
  switch (field) {
    case 'workDuration': return { min: 1, max: 60 };
    case 'breakDuration': return { min: 1, max: 60 };
    case 'cycles': return { min: 1, max: 10 };
    default: return { min: 1, max: 60 };
  }
}

function getFieldValue(field: string, snapshot: PomodoroSnapshot): number {
  switch (field) {
    case 'workDuration': return snapshot.config.workDuration;
    case 'breakDuration': return snapshot.config.breakDuration;
    case 'cycles': return snapshot.config.sessionsPerCycle;
    default: return 0;
  }
}

function focusedIndex(focusedField: ConfigField): number {
  if (!focusedField) return 0;
  const idx = ROWS.findIndex(r => r.field === focusedField);
  return idx >= 0 ? idx : 0;
}

export const startConfigScreen: GlassScreen<PomodoroSnapshot, PomodoroActions> = {
  display(snapshot: PomodoroSnapshot) {
    const fi = focusedIndex(snapshot.focusedField);

    const lines = [
      line('▉▊▋▌▍▎▏ POMODORO TIMER'),
      line(``)
    ];

    for (let i = 0; i < ROWS.length; i++) {
      const row = ROWS[i];
      const cursor = i === fi ? '☞ ' : '　 ';
      if (row.type === 'field') {
        const val = String(getFieldValue(row.field, snapshot)).padStart(3);
        lines.push(line(`${cursor}${row.label.padEnd(8)}${val} ${row.unit}`));
      } else {
        lines.push(line(`${cursor}${row.label}`));
      }
    }

    // pad to 9 lines then add hint
    while (lines.length < 9) lines.push(line(''));
    lines.push(line('[↑↓]Adjust [CLICK]Next [x2]Back'));

    return { lines };
  },

  action(action, nav, snapshot: PomodoroSnapshot, ctx: PomodoroActions) {
    const fi = focusedIndex(snapshot.focusedField);
    const currentRow = ROWS[fi];

    if (action.type === 'HIGHLIGHT_MOVE') {
      if (currentRow.type === 'field') {
        const range = fieldRange(currentRow.field);
        const delta = action.direction === 'up' ? 1 : -1;
        const cur = getFieldValue(currentRow.field, snapshot);
        const val = Math.max(range.min, Math.min(range.max, cur + delta));

        if (currentRow.field === 'workDuration') ctx.updateConfig({ workDuration: val });
        else if (currentRow.field === 'breakDuration') ctx.updateConfig({ breakDuration: val });
        else if (currentRow.field === 'cycles') ctx.updateConfig({ sessionsPerCycle: val });
      }
    } else if (action.type === 'SELECT_HIGHLIGHTED') {
      if (currentRow.type === 'action') {
        ctx.setFocusedField(null);
        ctx.startSession(snapshot.config);
        ctx.navigate(`/session/${Date.now()}`);
      } else if (fi < ROWS.length - 1) {
        ctx.setFocusedField(ROWS[fi + 1].field);
      }
    } else if (action.type === 'GO_BACK') {
      if (fi > 0) {
        ctx.setFocusedField(ROWS[fi - 1].field);
      }
    }

    return nav;
  },
};
