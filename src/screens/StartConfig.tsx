import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AppShell, NavHeader, Button, Card, ScrollPicker } from 'even-toolkit/web';
import { IcEditPlay, IcEdit } from 'even-toolkit/web/icons/svg-icons';
import { usePomodoroContext } from '../contexts/PomodoroContext';

function range(min: number, max: number) {
  return Array.from({ length: max - min + 1 }, (_, i) => ({
    value: String(min + i),
    label: String(min + i),
  }));
}

export default function StartConfig() {
  const navigate = useNavigate();
  const { config, updateConfig, startSession, setFocusedField } = usePomodoroContext();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleStart = () => {
    setFocusedField(null);
    startSession(config);
    navigate(`/session/${Date.now()}`);
  };

  const columns = useMemo(() => [
    { options: range(1, 60) },
    { options: range(1, 60) },
    { options: range(1, 10) },
  ], []);

  const pickerValue = useMemo(() => [
    String(config.workDuration),
    String(config.breakDuration),
    String(config.sessionsPerCycle),
  ], [config.workDuration, config.breakDuration, config.sessionsPerCycle]);

  const handleChange = (v: string[]) => {
    updateConfig({
      workDuration: Number(v[0]) || 1,
      breakDuration: Number(v[1]) || 1,
      sessionsPerCycle: Number(v[2]) || 1,
    });
  };

  return (
    <AppShell
      header={
        <NavHeader title="Ready" />
      }
    >
      <div className="px-3 pt-4 pb-8 flex flex-col gap-4">
        <Card className="p-4">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-text-dim text-[11px] mb-1">Work</div>
              <div className="text-[20px] font-bold">{config.workDuration}</div>
              <div className="text-text-dim text-[10px]">min</div>
            </div>
            <div>
              <div className="text-text-dim text-[11px] mb-1">Break</div>
              <div className="text-[20px] font-bold">{config.breakDuration}</div>
              <div className="text-text-dim text-[10px]">min</div>
            </div>
            <div>
              <div className="text-text-dim text-[11px] mb-1">Cycles</div>
              <div className="text-[20px] font-bold">{config.sessionsPerCycle}</div>
            </div>
          </div>
        </Card>

        <Button variant="secondary" onClick={() => setPickerOpen(true)} className="w-full">
          <IcEdit className="w-5 h-5" />
        </Button>

        <Button variant="default" onClick={handleStart} className="w-full">
          <IcEditPlay className="w-5 h-5" />
        </Button>

        <ScrollPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title="Work / Break / Cycles"
          columns={columns}
          value={pickerValue}
          onValueChange={handleChange}
        />
      </div>
    </AppShell>
  );
}
