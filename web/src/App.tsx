import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { advanceDay } from "./lib/state";
import { update, useAppState } from "./lib/store";
import { DashboardPage } from "./pages/DashboardPage";
import { ListeningPage } from "./pages/ListeningPage";
import { MiniTestPage } from "./pages/MiniTestPage";
import { MockTestPage } from "./pages/MockTestPage";
import { PlanPage } from "./pages/PlanPage";
import { ProgressPage } from "./pages/ProgressPage";
import { TodayPage } from "./pages/TodayPage";
import { ReadingPage } from "./pages/ReadingPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { VocabPage } from "./pages/VocabPage";

export function App() {
  const { profile } = useAppState();
  // Open the next day when its time has come: on start, and whenever the tab gets focus again.
  useEffect(() => {
    const check = () => update((s) => advanceDay(s, new Date()));
    check();
    window.addEventListener("focus", check);
    const t = setInterval(check, 60_000);
    return () => {
      window.removeEventListener("focus", check);
      clearInterval(t);
    };
  }, [profile]);
  if (!profile) return <OnboardingPage />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage profile={profile} />} />
        <Route path="/vocab" element={<VocabPage />} />
        <Route path="/plan" element={<PlanPage profile={profile} />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/progress" element={<ProgressPage profile={profile} />} />
        <Route path="/listening" element={<ListeningPage />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/mini-test" element={<MiniTestPage />} />
        <Route path="/exam" element={<MockTestPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
