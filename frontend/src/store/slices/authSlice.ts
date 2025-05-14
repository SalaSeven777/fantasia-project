import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService, { LoginCredentials, RegisterData } from '../../services/auth.service';
import { User } from '../../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Initialize auth state from localStorage
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Check if the user is already authenticated
export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  if (authService.isAuthenticated()) {
    const user = await authService.fetchCurrentUser();
    return user;
  }
  return null;
});

// Login the user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Register a new user
export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Show language selection prompt
export const showLanguagePrompt = createAsyncThunk(
  'auth/showLanguagePrompt', 
  async () => {
    authService.showLanguagePrompt();
    return null;
  }
);

// Logout the user
export const logout = createAsyncThunk('auth/logout', async () => {
  authService.logout();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        if (action.payload) {
          state.user = action.payload;
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.error.message || 'Authentication check failed';
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
          state.error = action.payload as string || 'Login failed';
      })
    
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
          state.error = action.payload as string || 'Registration failed';
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;

export default authSlice.reducer; 