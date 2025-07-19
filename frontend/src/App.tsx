// frontend/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import your existing theme
import { theme } from './styles/theme';

// Import your existing components
import { AuthProvider } from './context/auth/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute/ProtectedRoute';
import { DashboardRouter } from './components/dashboard/DashboardRouter/DashboardRouter';
import { LandingPage } from './pages/landing/LandingPage';
import { SignupForm } from './components/auth/SignupForm/SignupForm';
import { LoginForm } from './components/auth/LoginForm/LoginForm';
import { UnauthorizedPage } from './pages/ErrorPages/UnauthorizedPage';
import { NotFoundPage } from './pages/ErrorPages/NotFoundPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth/signup" element={<SignupForm />} />
                  <Route path="/auth/login" element={<LoginForm />} />
                  
                  {/* Protected Dashboard Routes */}
                  <Route 
                    path="/dashboard/*" 
                    element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Error Routes */}
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  closeOnClick
                  draggable
                  pauseOnHover
                  theme="dark"
                  toastStyle={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </LocalizationProvider>
      
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;