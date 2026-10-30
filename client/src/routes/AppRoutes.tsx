import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage'
import { OnboardingPage } from '../pages/auth/OnboardingPage'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { OverviewPage } from '../pages/dashboard/OverviewPage'
import { MyMeetingsPage } from '../pages/dashboard/MyMeetingsPage'
import { ScheduleMeetingPage } from '../pages/dashboard/ScheduleMeetingPage'
import { CalendarPage } from '../pages/dashboard/CalendarPage'
import { HistoryPage } from '../pages/HistoryPage'
import { WorkspacePage } from '../pages/dashboard/WorkspacePage'
import { AiInsightsPage } from '../pages/dashboard/AiInsightsPage'
import { TasksPage } from '../pages/dashboard/TasksPage'
import { RecordingsPage } from '../pages/dashboard/RecordingsPage'
import { SettingsPage } from '../pages/dashboard/SettingsPage'
import { MeetingRoomPage } from '../pages/meeting/MeetingRoomPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Marketing Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Authentication Flow */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* 3. Real-Time Dark Meeting Room */}
      <Route path="/room/:roomId" element={<MeetingRoomPage />} />

      {/* 4. Enterprise Light Dashboard */}
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="meetings" element={<MyMeetingsPage />} />
        <Route path="schedule" element={<ScheduleMeetingPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="workspace" element={<WorkspacePage />} />
        <Route path="insights" element={<AiInsightsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="recordings" element={<RecordingsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Legacy / Direct shortcuts */}
      <Route path="/history" element={<Navigate to="/app/history" replace />} />
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />

      {/* 5. 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
