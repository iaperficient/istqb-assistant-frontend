import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  UserCreate, 
  UserResponse, 
  UserInfo,
  UserCreateRequest,
  UserUpdateRequest,
  UserListResponse,
  UserStats,
  LoginData, 
  Token, 
  ChatMessage, 
  ChatResponse,
  ApiError,
  CertificationCreate,
  CertificationResponse,
  CertificationWithDocuments,
  DocumentResponse,
  DocumentUpload,
  DocumentUploadResponse
} from '../types/api';

const BASE_URL = 'http://localhost:8000';

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
        const originalRequest = error.config;
        
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

  async getUserStats(): Promise<UserStats> {
    try {
      const response = await this.api.get<UserStats>('/auth/admin/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // User Management endpoints
  async createUser(userData: UserCreateRequest): Promise<UserResponse> {
    try {
      const response = await this.api.post<UserResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // User management - using available endpoints and fallbacks
  async getAllUsers(page: number = 1, perPage: number = 10): Promise<UserListResponse> {
    try {
      // This endpoint is not available yet, return current user as demo
      const currentUser = await this.getCurrentUser();
      
      // Create a mock list with the current user for demonstration
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

  async updateUserRole(userId: number, role: string): Promise<UserResponse> {
    try {
      // This endpoint is not available yet - will need backend implementation
      // For now, simulate the response
      const currentUser = await this.getCurrentUser();
      return {
        id: userId,
        username: currentUser.username,
        email: currentUser.email,
        role: role,
        is_active: true,
        created_at: currentUser.created_at,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async deactivateUser(userId: number): Promise<void> {
    try {
      // Using the available endpoint
      await this.api.put(`/auth/users/${userId}/deactivate`);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      // This endpoint is not available yet - will need backend implementation
      // For now, just simulate success
      console.log(`Would delete user ${userId}`);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // RAG endpoints
  async getRagStatus(): Promise<any> {
    try {
      const response = await this.api.get('/rag/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async testRagRetrieval(query: string = 'What is ISTQB?'): Promise<any> {
    try {
      const response = await this.api.get(`/rag/test?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async searchKnowledgeBase(query: string, k: number = 5): Promise<any> {
    try {
      const response = await this.api.post(`/rag/search?query=${encodeURIComponent(query)}&k=${k}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Certification endpoints - Updated to use new API
  async createCertification(certificationData: CertificationCreate): Promise<CertificationResponse> {
    try {
      const response = await this.api.post<CertificationResponse>('/certifications/', certificationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async getCertifications(skip: number = 0, limit: number = 100): Promise<CertificationResponse[]> {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString()
      });
      const response = await this.api.get<CertificationResponse[]>(`/certifications/?${params}`);
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

      // Si el backend devuelve información sobre duplicados, la usamos
      // Si no, asumimos que fue exitoso
      return response.data || {
        success: true,
        message: 'Syllabus subido exitosamente'
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Verificar si es un error de duplicado
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

      // Si el backend devuelve información sobre duplicados, la usamos
      // Si no, asumimos que fue exitoso
      return response.data || {
        success: true,
        message: 'Examen de muestra subido exitosamente'
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Verificar si es un error de duplicado
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

  // Legacy method for backward compatibility with existing components
  async getProcessedCertifications(): Promise<any> {
    try {
      const certifications = await this.getCertifications();
      return {
        certifications: certifications.map(cert => ({
          id: cert.id,
          title: cert.name,
          level: this.extractLevelFromName(cert.name),
          url: cert.url,
          status: cert.is_active ? 'completed' : 'failed',
          document_count: 0, // Will be populated if needed
          created_at: cert.created_at
        }))
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  private extractLevelFromName(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('foundation')) return 'Foundation';
    if (lowerName.includes('advanced')) return 'Advanced';
    if (lowerName.includes('expert')) return 'Expert';
    if (lowerName.includes('specialist')) return 'Specialist';
    return 'General';
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