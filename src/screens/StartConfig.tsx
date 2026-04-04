import { useState, useCallback } from 'react';
import { AppShell, NavHeader, Button, Card } from 'even-toolkit/web';
import { IcEditPlay } from 'even-toolkit/web/icons/svg-icons';
import { usePomodoroContext } from '../contexts/PomodoroContext';
import { DEFAULT_CONFIG } from '../data/pomodoroDefaults';

const TEXT_MAX_WIDTH = 20; // half-width=1, full-width=2

function textWidth(str: string): number {
  let w = 0;
  for (const ch of str) {
    w += ch.charCodeAt(0) <= 0x7E ? 1 : 2;
  }
  return w;
}

const selectClass = "bg-transparent text-[20px] font-bold text-center appearance-none border border-neutral-300 rounded-md px-2 py-1 cursor-pointer";

const blurOnWheel = (e: React.WheelEvent<HTMLSelectElement>) => {
  e.currentTarget.blur();
};

export default function StartConfig() {
  const { config, updateConfig, startSession, setFocusedField } = usePomodoroContext();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const toggleOptions = useCallback(() => setOptionsOpen(v => !v), []);

  const handleStart = () => {
    setFocusedField(null);
    startSession(config);
    // Navigation is handled by PomodoroGlasses (Glass-primary)
  };

  const handleAlwaysShowDetail = (value: boolean) => {
    updateConfig({ alwaysShowDetail: value });
  };

  return (
    <AppShell
      header={
        <NavHeader title="Ready" />
      }
    >
      <div className="px-3 pt-4 pb-8 flex flex-col gap-4" onWheelCapture={(e) => e.stopPropagation()}>
        <Card className="p-4">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-text-dim text-[11px] mb-1">{config.textWork}</div>
              <select
                value={config.workDuration}
                onChange={(e) => updateConfig({ workDuration: Number(e.target.value) })}
                onWheel={blurOnWheel}
                className={selectClass}
              >
                {Array.from({ length: 60 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <div className="text-text-dim text-[10px]">min</div>
            </div>
            <div>
              <div className="text-text-dim text-[11px] mb-1">{config.textBreak}</div>
              <select
                value={config.breakDuration}
                onChange={(e) => updateConfig({ breakDuration: Number(e.target.value) })}
                onWheel={blurOnWheel}
                className={selectClass}
              >
                {Array.from({ length: 60 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <div className="text-text-dim text-[10px]">min</div>
            </div>
            <div>
              <div className="text-text-dim text-[11px] mb-1">Cycles</div>
              <select
                value={config.sessionsPerCycle}
                onChange={(e) => updateConfig({ sessionsPerCycle: Number(e.target.value) })}
                onWheel={blurOnWheel}
                className={selectClass}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Button variant="default" onClick={handleStart} className="w-full">
          <IcEditPlay className="w-5 h-5" />
        </Button>

        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={toggleOptions}
            className="w-full flex items-center justify-between p-4 text-sm font-semibold"
          >
            <span>OPTIONS</span>
            <span className={`transition-transform ${optionsOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {optionsOpen && (
            <div className="px-4 pb-4 border-t border-neutral-200 pt-3 flex flex-col gap-4">
              <div>
                <div className="mb-2 text-sm font-semibold">ALWAYS SHOW DETAIL</div>
                <div className="flex gap-3">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="alwaysShowDetail"
                      checked={config.alwaysShowDetail === true}
                      onChange={() => handleAlwaysShowDetail(true)}
                    />
                    <span>ON</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="alwaysShowDetail"
                      checked={config.alwaysShowDetail === false}
                      onChange={() => handleAlwaysShowDetail(false)}
                    />
                    <span>OFF</span>
                  </label>
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold">SHOW CLOCK</div>
                <div className="flex gap-3">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="showClock"
                      checked={config.showClock === true}
                      onChange={() => updateConfig({ showClock: true })}
                    />
                    <span>ON</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="showClock"
                      checked={config.showClock === false}
                      onChange={() => updateConfig({ showClock: false })}
                    />
                    <span>OFF</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="mb-3 text-sm font-semibold">TEXTS</div>
                <div className="flex flex-col gap-3">
                  {([
                    ['textWork', 'WORK'] as const,
                    ['textWorking', 'WORKING'] as const,
                    ['textBreak', 'BREAK'] as const,
                    ['textBreaking', 'BREAKING'] as const,
                    ['textGreatWork', 'GREAT WORK!'] as const,
                  ]).map(([field, label]) => (
                    <div key={field} className="flex items-center gap-2">
                      <label className="text-[11px] text-text-dim w-20 shrink-0">{label}</label>
                      <input
                        type="text"
                        value={config[field]}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (textWidth(v) <= TEXT_MAX_WIDTH) {
                            updateConfig({ [field]: v });
                          }
                        }}
                        className="flex-1 border border-neutral-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(true)}
                  className="w-full py-2 text-sm font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  RESET ALL SETTINGS
                </button>
              </div>
            </div>
          )}
        </div>

        {resetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 mx-6 w-full max-w-xs shadow-xl">
              <div className="text-center mb-4">
                <div className="text-sm font-semibold mb-1">Reset Settings</div>
                <div className="text-xs text-text-dim">All settings will be restored to defaults.</div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(false)}
                  className="flex-1 py-2 text-sm font-semibold border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateConfig(DEFAULT_CONFIG);
                    setResetConfirmOpen(false);
                  }}
                  className="flex-1 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
