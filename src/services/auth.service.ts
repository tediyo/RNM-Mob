import apiService from './api';
import API_CONFIG from '../config/api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Must match Nest backend AuthService.createAuthResponse()
export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.getInstance().post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        data
      );

      if (response.data.token) {
        await apiService.setToken(response.data.token);
      }

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiService.getInstance().post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        data
      );

      if (response.data.token) {
        await apiService.setToken(response.data.token);
      }

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    await apiService.removeToken();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await apiService.getToken();
    return !!token;
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export const authService = new AuthService();
export default authService;
