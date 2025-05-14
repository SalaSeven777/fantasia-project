import { apiService } from './api';
import { User } from '../types';
import { AxiosError } from 'axios';
import i18n from 'i18next';

export interface LoginCredentials {
    email: string;
    password: string;
    language?: string;
}

export interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface TokenResponse {
    access: string;
    refresh: string;
}

export interface ErrorResponseData {
    error?: string;
    detail?: string;
}

class AuthService {
    // API endpoints
    private readonly API_ENDPOINTS = {
        LOGIN: '/users/login/',
        REGISTER: '/users/register/',
        ME: '/users/me/',
        REFRESH: '/token/refresh/',
        UPDATE_PROFILE: '/users/me/update/',
    };
    
    // Local storage keys
    private readonly STORAGE_KEYS = {
        ACCESS_TOKEN: 'token',
        REFRESH_TOKEN: 'refreshToken',
        USER: 'user',
        LANGUAGE: 'userLanguage'
    };

    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // Try multiple possible endpoints
        const loginEndpoints = [
            this.API_ENDPOINTS.LOGIN, 
            '/token/',
            '/auth/login/'
        ];
        
        let lastError: any = null;
        
        // Try each endpoint
        for (const endpoint of loginEndpoints) {
            try {
                console.log(`Attempting login at: ${endpoint}`);
                
                // Include current language preference if available
                const loginData = { 
                    ...credentials,
                    language: credentials.language || i18n.language || 'en'
                };
                
                const response = await apiService.post<AuthResponse>(endpoint, loginData);
                
                // Store auth data
                this.setAccessToken(response.access);
                this.setRefreshToken(response.refresh);
                localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(response.user));
                
                // Store language preference
                const language = credentials.language || i18n.language || 'en';
                localStorage.setItem(this.STORAGE_KEYS.LANGUAGE, language);
                i18n.changeLanguage(language);
                
                // Try to update user profile with language preference
                try {
                    this.updateUserLanguagePreference(language);
                } catch (err) {
                    console.warn('Could not update language preference on server:', err);
                }
                
                // Show language selection prompt after successful login
                setTimeout(() => this.showLanguagePrompt(), 500);
                
                console.log('Login successful');
                return response;
            } catch (error) {
                console.error(`Login failed at ${endpoint}:`, error);
                lastError = error;
                
                // Continue to try the next endpoint
            }
        }
        
        // If we're here, all endpoints failed
        console.error('All login attempts failed. Last error:', lastError);
        
        // Extract and throw a meaningful error message
        if (lastError?.response?.data) {
            const errorData = lastError.response.data;
            const errorMessage = errorData.error || errorData.detail || 'Invalid credentials';
            throw new Error(errorMessage);
        }
        
        throw new Error('Login failed. Please check your credentials and try again.');
    }

    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            console.log('Sending registration data:', data);
            const response = await apiService.post<AuthResponse>(this.API_ENDPOINTS.REGISTER, data);
            
            // Store auth data
            this.setAccessToken(response.access);
            this.setRefreshToken(response.refresh);
            localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(response.user));
            
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            // Log the full error details
            if (error instanceof Error) {
                console.error('Error details:', error.message);
                if ('response' in error && error.response) {
                    console.error('Server response:', error.response);
                }
            }
            throw error; // Let the handleAuthError in the calling component handle it
        }
    }

    /**
     * Fetch current user data
     */
    async fetchCurrentUser(): Promise<User> {
        try {
            const user = await apiService.get<User>(this.API_ENDPOINTS.ME);
            
            // Check if the user has a language preference
            if (user && user.language_preference) {
                localStorage.setItem(this.STORAGE_KEYS.LANGUAGE, user.language_preference);
                i18n.changeLanguage(user.language_preference);
            }
            
            return user;
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            throw new Error('Failed to fetch user data');
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(): Promise<string | null> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return null;
        }

        try {
            const response = await apiService.post<TokenResponse>(this.API_ENDPOINTS.REFRESH, {
                refresh: refreshToken
            });
            
            if (response && response.access) {
                this.setAccessToken(response.access);
                return response.access;
            }
            return null;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            this.clearAuthData();
            return null;
        }
    }

    /**
     * Logout the current user
     */
    logout(): void {
        this.clearAuthData();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = this.getAccessToken();
        const user = this.getCurrentUser();
        return !!token && !!user;
    }

    /**
     * Get current user from local storage
     */
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem(this.STORAGE_KEYS.USER);
        if (!userStr) {
            return null;
        }
        
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Failed to parse user data:', error);
            this.clearAuthData();
            return null;
        }
    }

    /**
     * Get access token from local storage
     */
    getAccessToken(): string | null {
        return localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
    }

    /**
     * Get refresh token from local storage
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    }

    /**
     * Set access token in local storage
     */
    private setAccessToken(token: string): void {
        localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, token);
    }

    /**
     * Set refresh token in local storage
     */
    private setRefreshToken(token: string): void {
        localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, token);
    }

    /**
     * Update user language preference on the server
     */
    async updateUserLanguagePreference(language: string): Promise<void> {
        try {
            await apiService.patch(this.API_ENDPOINTS.UPDATE_PROFILE, { 
                language_preference: language 
            });
            console.log('Updated language preference on server');
        } catch (error) {
            console.error('Failed to update language preference:', error);
            // Don't throw - this is not a critical operation
        }
    }

    /**
     * Get user's language preference
     */
    getUserLanguage(): string {
        return localStorage.getItem(this.STORAGE_KEYS.LANGUAGE) || 'en';
    }

    /**
     * Clear all auth data from local storage
     */
    private clearAuthData(): void {
        localStorage.removeItem(this.STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(this.STORAGE_KEYS.USER);
        // Note: We don't remove language preference on logout
    }

    /**
     * Handle authentication errors
     */
    private handleAuthError(error: AxiosError<ErrorResponseData>): never {
        if (error.response?.data) {
            const errorData = error.response.data;
            throw new Error(errorData.error || errorData.detail || 'Authentication failed');
        }
        throw new Error('Authentication failed. Please try again later.');
    }

    /**
     * Show language prompt after login
     */
    showLanguagePrompt(): void {
        // Get available languages
        const languages = {
            en: 'English',
            fr: 'Français',
            ar: 'العربية'
        };
        
        // Current language
        const currentLang = this.getUserLanguage();
        
        // Create alert message for each language
        const message = 
            `Please select your preferred language / Veuillez sélectionner votre langue préférée / الرجاء اختيار لغتك المفضلة:\n\n` +
            `1. English\n` +
            `2. Français\n` +
            `3. العربية\n`;
        
        // Show prompt
        const selection = window.prompt(message, currentLang);
        
        if (selection) {
            let newLanguage = currentLang;
            
            // Handle numeric selections
            if (selection === '1') {
                newLanguage = 'en';
            } else if (selection === '2') {
                newLanguage = 'fr';
            } else if (selection === '3') {
                newLanguage = 'ar';
            } 
            // Handle language codes
            else if (['en', 'fr', 'ar'].includes(selection.toLowerCase())) {
                newLanguage = selection.toLowerCase();
            }
            // Handle full language names
            else if (selection.toLowerCase() === 'english') {
                newLanguage = 'en';
            } else if (selection.toLowerCase() === 'français' || selection.toLowerCase() === 'francais') {
                newLanguage = 'fr';
            } else if (selection.toLowerCase() === 'العربية' || selection.toLowerCase() === 'arabic') {
                newLanguage = 'ar';
            }
            
            // Change language if different from current
            if (newLanguage !== currentLang) {
                i18n.changeLanguage(newLanguage);
                localStorage.setItem(this.STORAGE_KEYS.LANGUAGE, newLanguage);
                this.updateUserLanguagePreference(newLanguage);
                
                // Reload page to apply RTL for Arabic if needed
                if ((newLanguage === 'ar' && document.dir !== 'rtl') || 
                    (newLanguage !== 'ar' && document.dir === 'rtl')) {
                    window.location.reload();
                }
            }
        }
    }
}

export const authService = new AuthService();
export default authService; 