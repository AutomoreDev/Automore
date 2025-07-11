import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

// Import from your shared types
import { ApiResponse } from '../../../../shared/types/api';

class ApiClient {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';
    
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle your backend error responses
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle your backend's error format
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Check if it's a TOKEN_EXPIRED error from your backend
          if (error.response?.data?.error === 'TOKEN_EXPIRED') {
            try {
              const refreshToken = localStorage.getItem('refreshToken');
              if (refreshToken) {
                const response = await this.post<{ accessToken: string }>('/auth/refresh', {
                  refreshToken
                });
                
                if (response.success && response.data?.accessToken) {
                  localStorage.setItem('accessToken', response.data.accessToken);
                  originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                  return this.instance(originalRequest);
                }
              }
            } catch (refreshError) {
              // Refresh failed, redirect to login
              this.handleAuthError();
              return Promise.reject(refreshError);
            }
          } else {
            // Other auth errors, redirect to login
            this.handleAuthError();
          }
        }

        // Handle other errors from your backend
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleAuthError() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth/login';
  }

  private handleApiError(error: any) {
    const errorData = error.response?.data;
    
    if (errorData?.message) {
      toast.error(errorData.message);
    } else if (error.message) {
      toast.error(error.message);
    }

    // Route to error pages based on your backend status codes
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
    } else if (error.response?.status === 404) {
      // Don't redirect for API 404s, only for page routes
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.get(url, config);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.post(url, data, config);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.put(url, data, config);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.delete(url, config);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  }
}

export const apiClient = new ApiClient();