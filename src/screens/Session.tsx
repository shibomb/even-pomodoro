import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AppShell, NavHeader, Button, TimerRing } from 'even-toolkit/web';
import { IcEditPause, IcEditPlay, IcStatusComplete } from 'even-toolkit/web/icons/svg-icons';
import { usePomodoroContext } from '../contexts/PomodoroContext';

function formatTime(seconds: number): string {
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function Session() {
  const navigate = useNavigate();
  const { activeSession, config, pauseSession, resumeSession, completeSession } = usePomodoroContext();

  useEffect(() => {
    if (!activeSession) {
      navigate('/', { replace: true });
    } else if (activeSession.finishedAt) {
      navigate(`/session/${activeSession.sessionId}/complete`, { replace: true });
    }
  }, [activeSession, activeSession?.finishedAt, navigate]);

  if (!activeSession || activeSession.finishedAt) return null;

  const phase = activeSession.phase;
  const totalSeconds = phase === 'work'
    ? config.workDuration * 60
    : config.breakDuration * 60;
  const phaseLabel = phase === 'work' ? 'Working' : 'Breaking';

  return (
    <AppShell
      header={
        <NavHeader title={`${phaseLabel} (${activeSession.cycleNumber}/${config.sessionsPerCycle})`} />
      }
    >
      <div className="px-3 pt-8 pb-8 flex flex-col items-center gap-8">
        <TimerRing
          remaining={Math.floor(activeSession.timeRemaining)}
          total={totalSeconds}
          size={200}
          strokeWidth={8}
          formatFn={formatTime}
        />

        <div className="flex gap-3 w-full">
          {activeSession.isRunning ? (
            <Button variant="secondary" onClick={pauseSession} className="flex-1">
              <IcEditPause className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="secondary" onClick={resumeSession} className="flex-1">
              <IcEditPlay className="w-5 h-5" />
            </Button>
          )}

          <Button variant="default" onClick={completeSession} className="flex-1">
            <IcStatusComplete className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
