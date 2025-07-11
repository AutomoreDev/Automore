import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  IconButton,
  InputAdornment,
  useTheme,
  Container,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  RocketLaunch
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  rememberMe: yup.boolean().optional()
});

export const LoginForm: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error: any) {
      setError('password', { 
        type: 'manual', 
        message: error.message || 'Invalid email or password' 
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.background.paper}95, ${theme.palette.background.paper}98)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                  }}
                >
                  <RocketLaunch sx={{ fontSize: 32, color: 'white' }} />
                </Box>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  Automore
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 400,
                    mb: 1,
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    opacity: 0.8,
                  }}
                >
                  Sign in to access your automation portal
                </Typography>
              </motion.div>
            </Box>

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Box component="form" onSubmit={handleSubmit(onSubmit as any)} noValidate>
                <TextField
                  {...register('email')}
                  fullWidth
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 4px 16px ${theme.palette.primary.main}20`,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  {...register('password')}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 4px 16px ${theme.palette.primary.main}20`,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        {...register('rememberMe')} 
                        sx={{ color: theme.palette.primary.main }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Remember me
                      </Typography>
                    }
                  />
                  <Button
                    component={Link}
                    to="/auth/forgot-password"
                    sx={{
                      textTransform: 'none',
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot password?
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !isValid}
                  sx={{ 
                    mb: 3,
                    py: 1.8,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 32px ${theme.palette.primary.main}50`,
                    },
                    '&:disabled': {
                      transform: 'none',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} color="inherit" />
                      Signing In...
                    </Box>
                  ) : (
                    'Sign In to Portal'
                  )}
                </Button>

                {/* Quick Access Links */}
                <Box sx={{ 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Need assistance?
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      sx={{
                        textTransform: 'none',
                        color: theme.palette.text.secondary,
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: theme.palette.primary.main,
                        },
                      }}
                      onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfYSlp8HDDw2vrqXmCf4N1LAWcdi4FkiEBMjTyr3ma9ctH2Sg/viewform?usp=header', '_blank')}
                    >
                      Free Assessment
                    </Button>
                    <Button
                      size="small"
                      sx={{
                        textTransform: 'none',
                        color: theme.palette.text.secondary,
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: theme.palette.primary.main,
                        },
                      }}
                      onClick={() => window.open('https://calendar.app.google/n9gwu2EJh2h15nHLA', '_blank')}
                    >
                      Book Demo
                    </Button>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};