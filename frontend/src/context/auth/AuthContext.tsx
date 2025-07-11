import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthUser } from '../../../../shared/types/auth';
import { authApi } from '../../services/api/authApi';
import { toast } from 'react-toastify';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<boolean>;
  checkPermission: (permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
}

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: Partial<AuthUser> };

const initialState: AuthState = {
  user: null,
  loading: true,
  initialized: false
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: state.user ? { ...state.user, ...action.payload } : null 
      };
    default:
      return state;
  }
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await authApi.getProfile();
        if (response.success && response.data) {
          dispatch({ type: 'SET_USER', payload: response.data });
        } else {
          // Invalid token, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authApi.login({ email, password, rememberMe });
      
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        dispatch({ type: 'SET_USER', payload: user });
        toast.success(`Welcome back, ${user.firstName}!`);
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authApi.register(userData);
      
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        dispatch({ type: 'SET_USER', payload: user });
        toast.success('Account created successfully!');
        return true;
      } else {
        toast.error(response.message || 'Registration failed');
        return false;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'SET_USER', payload: null });
      toast.info('You have been logged out');
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>): Promise<boolean> => {
    try {
      const response = await authApi.updateProfile(updates);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_USER', payload: response.data });
        toast.success('Profile updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Failed to update profile');
      return false;
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!state.user) return false;
    return state.user.permissions?.includes(permission) || false;
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!state.user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.user.role);
  };

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    checkPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};