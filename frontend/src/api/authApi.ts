import axiosClient from './axiosClient';
import type { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest } from '../types';

const authApi = {
  login: (data: LoginRequest) => {
    return axiosClient.post<AuthResponse>('/api/auth/login', data);
  },

  register: (data: RegisterRequest) => {
    return axiosClient.post<AuthResponse>('/api/auth/register', data);
  },

  refreshToken: (data: RefreshTokenRequest) => {
    return axiosClient.post<AuthResponse>('/api/auth/refresh', data);
  },

  logout: (data: RefreshTokenRequest) => {
    return axiosClient.post('/api/auth/logout', data);
  },
};

export default authApi;
