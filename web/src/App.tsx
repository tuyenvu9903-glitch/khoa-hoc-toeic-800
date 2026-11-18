import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAppState } from "./lib/store";
import { DashboardPage } from "./pages/DashboardPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { VocabPage } from "./pages/VocabPage";

export function App() {
  const { profile } = useAppState();
  if (!profile) return <OnboardingPage />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage profile={profile} />} />
        <Route path="/vocab" element={<VocabPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
