import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  UserCreate, 
  UserResponse, 
  UserInfo,
  LoginData, 
  Token, 
  ChatMessage, 
  ChatResponse,
  ApiError
} from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

class ApiService {
  private api: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            if (this.tokenRefreshPromise) {
              const newToken = await this.tokenRefreshPromise;
              originalRequest.headers!.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
            
            this.handleTokenExpiration();
            return Promise.reject(this.createApiError('Session expired', 401));
          } catch (refreshError) {
            this.handleTokenExpiration();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const data = error.response.data as any;
      if (data.detail) {
        if (Array.isArray(data.detail)) {
          return this.createApiError(data.detail[0]?.msg || 'Validation error', error.response.status);
        }
        return this.createApiError(data.detail, error.response.status);
      }
    }
    
    return this.createApiError(
      error.message || 'An unexpected error occurred',
      error.response?.status
    );
  }

  private createApiError(message: string, status?: number): ApiError {
    return { message, status };
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('access_token');
  }

  private handleTokenExpiration(): void {
    this.removeToken();
    window.dispatchEvent(new CustomEvent('tokenExpired'));
  }

  async register(userData: UserCreate): Promise<UserResponse> {
    try {
      const response = await this.api.post<UserResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async login(loginData: LoginData): Promise<Token> {
    try {
      const formData = new URLSearchParams();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);

      const response = await this.api.post<Token>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.setToken(response.data.access_token);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async chat(message: ChatMessage): Promise<ChatResponse> {
    try {
      const response = await this.api.post<ChatResponse>('/chat/', message);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await this.api.get<UserInfo>('/auth/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new ApiService();