import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Pages
import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import FamilyCreatePage from './pages/FamilyCreatePage';
import FamilyDetailPage from './pages/FamilyDetailPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskCreatePage from './pages/TaskCreatePage';
import InvitationAcceptance from './pages/InvitationAcceptance';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Parent-only routes - must come before dynamic routes to avoid conflicts */}
              <Route element={<ProtectedRoute roles={['parent']} />}>
                <Route path="/families/create" element={<FamilyCreatePage />} />
                <Route path="/parent-dashboard" element={<Dashboard />} />
                <Route path="/tasks/create" element={<TaskCreatePage />} />
              </Route>
              
              {/* Protected routes - accessible to all authenticated users */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Family details accessible to both parent and child */}
                <Route path="/families/:id" element={<FamilyDetailPage />} />
                {/* Task routes */}
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />
                {/* Invitation acceptance - requires authentication */}
                <Route path="/invitations/accept" element={<InvitationAcceptance />} />
              </Route>

              {/* Redirects */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
