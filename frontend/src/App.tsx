// Rule applied: Use absolute imports for all files @/...
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { HelmetProvider } from 'react-helmet-async';

// Pages
import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import FlockCreatePage from './pages/FlockCreatePage';
import FlockDetailPage from './pages/FlockDetailPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskCreatePage from './pages/TaskCreatePage';
import TaskEditPage from './pages/TaskEditPage';
import TaskDashboardPage from './pages/TaskDashboardPage';
import TaskCalendarPage from './pages/TaskCalendarPage';
import InvitationAcceptance from './pages/InvitationAcceptance';
import NotificationPreferencesPage from './pages/NotificationPreferencesPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

// Components
// Rule applied: Use absolute imports for all files @/...
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/layout/Layout';

// Import the responsive theme
// Rule applied: Use absolute imports for all files @/...
import { theme } from '@/theme';

function App(): JSX.Element {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <AuthProvider>
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Parent-only routes - must come before dynamic routes to avoid conflicts */}
                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route path="/flocks/create" element={<FlockCreatePage />} />
                  <Route path="/parent-dashboard" element={<Dashboard />} />
                  <Route path="/tasks/create" element={<TaskCreatePage />} />
                </Route>
                
                {/* Protected routes - accessible to all authenticated users */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* Flock details accessible to both parent and child */}
                  <Route path="/flocks/:id" element={<FlockDetailPage />} />
                  {/* Task routes */}
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/tasks/dashboard" element={<TaskDashboardPage />} />
                  <Route path="/tasks/calendar" element={<TaskCalendarPage />} />
                  <Route path="/tasks/:id" element={<TaskDetailPage />} />
                  <Route path="/tasks/:id/edit" element={<TaskEditPage />} />
                  {/* Notification settings */}
                  <Route path="/settings/notifications" element={<NotificationPreferencesPage />} />
                  {/* Invitation acceptance - requires authentication */}
                  <Route path="/invitations/accept" element={<InvitationAcceptance />} />
                </Route>

                {/* Redirects */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </AuthProvider>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  </HelmetProvider>
  );
};

export default App;
