import { BrowserRouter, Routes, Route } from 'react-router';
import { PomodoroProvider } from './contexts/PomodoroContext';
import { PomodoroGlasses } from './glass/PomodoroGlasses';
import StartConfig from './screens/StartConfig';
import Session from './screens/Session';
import Complete from './screens/Complete';

export default function App() {
  return (
    <BrowserRouter>
      <PomodoroProvider>
        <PomodoroGlasses />
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<StartConfig />} />
            <Route path="/config" element={<StartConfig />} />
            <Route path="/session/:id" element={<Session />} />
            <Route path="/session/:id/complete" element={<Complete />} />
          </Routes>
        </div>
      </PomodoroProvider>
    </BrowserRouter>
  );
}
