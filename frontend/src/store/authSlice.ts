import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthResponse } from '../types';
import authApi from '../api/authApi';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedJson);
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const loadUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    if (storedUser && accessToken) {
      if (isTokenExpired(accessToken)) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return null;
      }
      return JSON.parse(storedUser);
    }
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
  return null;
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  isLoading: false,
  error: null,
};
const handleAuthResponse = (data: AuthResponse): User => {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);

  const userData: User = {
    id: data.id,
    username: data.username,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
  };
  localStorage.setItem('user', JSON.stringify(userData));
  return userData;
};

export const loginUser = createAsyncThunk<
  User,
  { username: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async ({ username, password }, { rejectWithValue }) => {
  try {
    const response = await authApi.login({ username, password });
    return handleAuthResponse(response.data);
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Login failed. Please try again.';
    return rejectWithValue(message);
  }
});

export const registerUser = createAsyncThunk<
  User,
  { username: string; password: string; fullName: string; email: string; phone?: string },
  { rejectValue: string }
>('auth/registerUser', async ({ username, password, fullName, email, phone }, { rejectWithValue }) => {
  try {
    const response = await authApi.register({ username, password, fullName, email, phone });
    return handleAuthResponse(response.data);
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Registration failed. Please try again.';
    return rejectWithValue(message);
  }
});

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logoutUser',
  async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authApi.logout({ refreshToken });
      } catch {
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    // Dùng cho Google OAuth callback — set credentials trực tiếp
    setCredentialsFromOAuth(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>
    ) {
      const { accessToken, refreshToken, user } = action.payload;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      state.user = user;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed.';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Registration failed.';
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError, setCredentialsFromOAuth } = authSlice.actions;
export default authSlice.reducer;
