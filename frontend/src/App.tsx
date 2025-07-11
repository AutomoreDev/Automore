// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import your existing theme
import { theme } from './styles/theme';

// Import your components
import { AuthProvider } from './context/auth/AuthContext';
import { LandingPage } from './pages/landing/LandingPage';
import { SignupForm } from './components/auth/SignupForm/SignupForm';
import { LoginForm } from './components/auth/LoginForm/LoginForm';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            {/* Header removed - will be handled by individual pages */}
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/signup" element={<SignupForm />} />
              <Route path="/auth/login" element={<LoginForm />} />
            </Routes>
            
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              closeOnClick
              draggable
              pauseOnHover
              theme="light"
              toastStyle={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;