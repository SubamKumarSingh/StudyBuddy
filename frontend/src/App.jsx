import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import PDFs from "./pages/PDFs";
import Study from "./pages/Study";
import Analytics from "./pages/Analytics";
import AIDashboard from "./pages/AIDashboardModern";
import MCQHistory from "./pages/MCQHistory";
import Settings from "./pages/Settings";
import TargetOnboarding from "./pages/TargetOnboarding";

import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />

        {/* ================= AUTH ================= */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
        </Route>

        {/* ================= APP (PROTECTED) ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard home */}
          <Route index element={<Dashboard />} />

          {/* PDFs (main entry point for studying) */}
          <Route path="pdfs" element={<PDFs />} />

          {/* Study is ALWAYS contextual */}
          <Route path="study/:pdfId" element={<Study />} />

          {/* Future pages */}
          <Route path="analytics" element={<Analytics />} />
          <Route path="onboarding" element={<TargetOnboarding />} />

          <Route path="aitutor" element={<AIDashboard />} />
          <Route path="mcqhistory" element={<MCQHistory />} />
          <Route path="settings" element={<Settings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
