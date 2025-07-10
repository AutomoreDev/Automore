import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define your brand colors based on Google Sites design
const brandColors = {
  primary: '#6366F1', // Indigo from your design
  primaryDark: '#4F46E5',
  secondary: '#0D9488', // Teal accent
  background: '#1c1c1c', // Dark background from your design
  surface: '#2a2a2a',
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: brandColors.primary,
      dark: brandColors.primaryDark,
      contrastText: brandColors.white,
    },
    secondary: {
      main: brandColors.secondary,
      contrastText: brandColors.white,
    },
    background: {
      default: brandColors.background,
      paper: brandColors.surface,
    },
    text: {
      primary: brandColors.white,
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: 'clamp(40px, 10vw, 70px)',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 'clamp(32px, 8vw, 48px)',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 'clamp(24px, 6vw, 32px)',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '16px',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '14px',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          textTransform: 'none',
          fontSize: '16px',
          fontWeight: 500,
          padding: '12px 32px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: brandColors.surface,
          border: `1px solid ${brandColors.gray[700]}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);
export { brandColors };