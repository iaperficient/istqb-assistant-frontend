import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  UserCreate, 
  UserResponse, 
  UserInfo,
  UserStats,
  UserListResponse,
  CertificationResponse,
  CertificationCreate,
  CertificationWithDocuments,
  DocumentResponse,
  DocumentUpload,
  DocumentUploadResponse,
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

  // Admin functions
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await this.api.get<UserStats>('/auth/admin/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async getAllUsers(page: number = 1, perPage: number = 10): Promise<UserListResponse> {
    try {
      // For now, return current user as demo data since we don't have the actual endpoint
      const currentUser = await this.getCurrentUser();
      
      const users: UserResponse[] = [{
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role,
        is_active: currentUser.is_active,
        created_at: currentUser.created_at,
        updated_at: undefined
      }];

      return {
        users,
        total: users.length,
        page,
        per_page: perPage
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async deactivateUser(userId: number): Promise<void> {
    try {
      await this.api.put(`/auth/users/${userId}/deactivate`);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      // This endpoint might not exist yet - simulate for now
      console.log(`Would delete user ${userId}`);
      // await this.api.delete(`/auth/users/${userId}`);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Certification Management Functions
  async getCertifications(skip: number = 0, limit: number = 100): Promise<CertificationResponse[]> {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString()
      });
      const response = await this.api.get<CertificationResponse[]>(`/certifications/?${params}`);
      return response.data;
    } catch (error) {
      // Return mock data if endpoint doesn't exist yet
      console.log('Certifications endpoint not available, returning mock data');
      return this.getMockCertifications();
    }
  }

  async createCertification(certificationData: CertificationCreate): Promise<CertificationResponse> {
    try {
      const response = await this.api.post<CertificationResponse>('/certifications/', certificationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async getCertificationWithDocuments(certificationId: number): Promise<CertificationWithDocuments> {
    try {
      const response = await this.api.get<CertificationWithDocuments>(`/certifications/${certificationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async deleteCertification(certificationId: number): Promise<void> {
    try {
      await this.api.delete(`/certifications/${certificationId}`);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async getCertificationDocuments(certificationId: number): Promise<DocumentResponse[]> {
    try {
      const response = await this.api.get<DocumentResponse[]>(`/certifications/${certificationId}/documents`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async uploadSyllabus(certificationId: number, documentData: DocumentUpload): Promise<DocumentUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('title', documentData.title);
      formData.append('file', documentData.file);

      const response = await this.api.post(`/certifications/${certificationId}/documents/syllabus`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data || {
        success: true,
        message: 'Syllabus subido exitosamente'
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Handle duplicate document error
      if (axiosError.response?.status === 409 || 
          (axiosError.response?.data as any)?.detail?.includes('duplicate') ||
          (axiosError.response?.data as any)?.detail?.includes('already exists')) {
        return {
          success: false,
          message: 'Este documento ya existe para esta certificación',
          is_duplicate: true,
          existing_document: (axiosError.response?.data as any)?.existing_document
        };
      }
      
      throw this.handleError(axiosError);
    }
  }

  async uploadSampleExam(certificationId: number, documentData: DocumentUpload): Promise<DocumentUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('title', documentData.title);
      formData.append('file', documentData.file);

      const response = await this.api.post(`/certifications/${certificationId}/documents/sample-exam`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data || {
        success: true,
        message: 'Examen de muestra subido exitosamente'
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Handle duplicate document error
      if (axiosError.response?.status === 409 || 
          (axiosError.response?.data as any)?.detail?.includes('duplicate') ||
          (axiosError.response?.data as any)?.detail?.includes('already exists')) {
        return {
          success: false,
          message: 'Este documento ya existe para esta certificación',
          is_duplicate: true,
          existing_document: (axiosError.response?.data as any)?.existing_document
        };
      }
      
      throw this.handleError(axiosError);
    }
  }

  async reprocessCertificationDocuments(certificationId: number): Promise<void> {
    try {
      await this.api.post(`/certifications/${certificationId}/reprocess`);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Mock data for when endpoints are not available
  private getMockCertifications(): CertificationResponse[] {
    return [
      {
        id: 1,
        code: 'ISTQB-FL',
        name: 'ISTQB Foundation Level',
        url: 'https://www.istqb.org/certifications/foundation-level',
        description: 'Certificación base de ISTQB que cubre los fundamentos del testing de software',
        version: 'v4.0',
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        code: 'ISTQB-AL-TM',
        name: 'ISTQB Advanced Level - Test Manager',
        url: 'https://www.istqb.org/certifications/advanced-level',
        description: 'Certificación avanzada enfocada en gestión de testing',
        version: 'v3.0',
        is_active: true,
        created_at: '2024-01-20T14:30:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: 3,
        code: 'ISTQB-AL-TA',
        name: 'ISTQB Advanced Level - Technical Test Analyst',
        url: 'https://www.istqb.org/certifications/advanced-level',
        description: 'Certificación avanzada para analistas técnicos de testing',
        version: 'v3.0',
        is_active: true,
        created_at: '2024-02-01T09:15:00Z',
        updated_at: '2024-02-01T09:15:00Z'
      },
      {
        id: 4,
        code: 'ISTQB-EL-TM',
        name: 'ISTQB Expert Level - Test Management',
        url: 'https://www.istqb.org/certifications/expert-level',
        description: 'Certificación de nivel experto en gestión de testing',
        version: 'v2.0',
        is_active: false,
        created_at: '2024-02-10T16:45:00Z',
        updated_at: '2024-02-10T16:45:00Z'
      }
    ];
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