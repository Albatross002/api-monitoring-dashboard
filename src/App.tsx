import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LoginPage } from "@/pages/login"
import { DashboardHome } from "@/pages/dashboard/home"
import { AnalyticsPage } from "@/pages/dashboard/analytics"
import { SettingsPage } from "@/pages/dashboard/settings"
import { AddApiPage } from "@/pages/dashboard/add-api"
import { MyApisPage } from "@/pages/dashboard/my-apis"
import { LogsPage } from "@/pages/dashboard/logs"
import { BillingPage } from "@/pages/dashboard/billing"

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="apis" element={<MyApisPage />} />
              <Route path="apis/new" element={<AddApiPage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
