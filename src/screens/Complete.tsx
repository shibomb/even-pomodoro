import { useNavigate } from 'react-router';
import { AppShell, NavHeader, Button, Card } from 'even-toolkit/web';
import { IcMenuHome } from 'even-toolkit/web/icons/svg-icons';
import { usePomodoroContext } from '../contexts/PomodoroContext';

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function Complete() {
  const navigate = useNavigate();
  const { activeSession, config } = usePomodoroContext();

  if (!activeSession || activeSession.finishedAt === null) {
    return null;
  }

  const totalDuration = activeSession.finishedAt - activeSession.startedAt;
  const cyclesCompleted = activeSession.cycleNumber;

  return (
    <AppShell
      header={
        <NavHeader title="Complete!" />
      }
    >
      <div className="px-3 pt-8 pb-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-[20px] font-bold">Great work!</div>
        </div>

        <Card className="w-full p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-[12px]">Cycles Completed</span>
              <span className="text-[16px] font-bold">{cyclesCompleted} / {config.sessionsPerCycle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-[12px]">Total Duration</span>
              <span className="text-[16px] font-bold">{formatTime(Math.floor(totalDuration / 1000))}</span>
            </div>
          </div>
        </Card>

        <Button variant="default" onClick={() => navigate('/')} className="w-full">
          <IcMenuHome className="w-5 h-5" />
        </Button>
      </div>
    </AppShell>
  );
}
