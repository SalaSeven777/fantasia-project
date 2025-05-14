import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ApiError } from '../types';

// Set base URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

console.log('API base URL:', API_BASE_URL);

// Token storage keys - must match with auth service
const TOKEN_STORAGE_KEY = 'token';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Adding timeout to prevent hanging requests
    timeout: 10000,
    // Adding withCredentials for cookies if needed
    withCredentials: false,
});

// Add console log for debugging if in development
if (process.env.NODE_ENV === 'development') {
    api.interceptors.request.use(request => {
        console.log('API Request:', request.method?.toUpperCase(), request.url, request.params || {});
        return request;
    });
    
    api.interceptors.response.use(response => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    }, error => {
        console.error('API Error Response:', error.response?.status, error.config?.url, error.response?.data || error.message);
        return Promise.reject(error);
    });
}

// Request interceptor - add auth token to each request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - handle token refresh on 401
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
                
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                    refresh: refreshToken,
                });
                
                if (response.data && response.data.access) {
                    // Store the new token
                    localStorage.setItem(TOKEN_STORAGE_KEY, response.data.access);
                    
                    // Update the Authorization header
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    
                    // Retry the original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Clear auth data and redirect to login
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
                localStorage.removeItem('user');
                
                // Redirect to login page only if it's not a public route
                if (!originalRequest.url?.includes('products')) {
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

interface ErrorResponse {
    error?: string;
    detail?: string;
}

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = api;
    }

    private handleResponse<T>(response: AxiosResponse): T {
        return response.data;
    }

    private handleError(error: any): never {
        console.error('API Error:', error);
        
        // Network error
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - server took too long to respond');
        }
        
        if (!error.response) {
            throw new Error('Network error - could not connect to the server');
        }
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            
            const errorData = error.response.data;
            let errorMessage = 'An error occurred';
            
            // Handle different error formats
            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.non_field_errors) {
                errorMessage = Array.isArray(errorData.non_field_errors) 
                    ? errorData.non_field_errors.join(', ') 
                    : String(errorData.non_field_errors);
            } else if (typeof errorData === 'object') {
                // Try to extract error messages from validation errors
                const errorMessages = [];
                for (const key in errorData) {
                    const value = errorData[key];
                    if (Array.isArray(value)) {
                        errorMessages.push(`${key}: ${value.join(', ')}`);
                    } else if (value) {
                        errorMessages.push(`${key}: ${value}`);
                    }
                }
                
                if (errorMessages.length > 0) {
                    errorMessage = errorMessages.join('; ');
                }
            }
            
            const apiError: ApiError = {
                message: errorMessage,
                status: error.response.status,
                code: errorData.code || 'UNKNOWN_ERROR',
                errors: errorData
            };
            
            throw apiError;
        }
        
        // For network errors or other issues
        throw new Error(error.message || 'Network error occurred');
    }

    async get<T>(url: string, params?: Record<string, any>): Promise<T> {
        try {
            const response = await this.api.get(url, { params });
            return this.handleResponse<T>(response);
        } catch (error) {
            return this.handleError(error as AxiosError<ErrorResponse>);
        }
    }

    async post<T>(url: string, data: any): Promise<T> {
        try {
            const response = await this.api.post(url, data);
            return this.handleResponse<T>(response);
        } catch (error) {
            return this.handleError(error as AxiosError<ErrorResponse>);
        }
    }

    async put<T>(url: string, data: any): Promise<T> {
        try {
            const response = await this.api.put(url, data);
            return this.handleResponse<T>(response);
        } catch (error) {
            return this.handleError(error as AxiosError<ErrorResponse>);
        }
    }

    async patch<T>(url: string, data: any): Promise<T> {
        try {
            const response = await this.api.patch(url, data);
            return this.handleResponse<T>(response);
        } catch (error) {
            return this.handleError(error as AxiosError<ErrorResponse>);
        }
    }

    async delete<T>(url: string): Promise<T> {
        try {
            const response = await this.api.delete(url);
            return this.handleResponse<T>(response);
        } catch (error) {
            return this.handleError(error as AxiosError<ErrorResponse>);
        }
    }
}

export const apiService = new ApiService(); 