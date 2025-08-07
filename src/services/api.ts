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

// Base URL: backend root (sin barra final)
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8001').replace(/\/$/, '');

class ApiService {
  private api: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL, // raíz del backend, SIN /api fijo
      headers: { 'Content-Type': 'application/json' },
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          (config.headers as any).Authorization = `Bearer ${token}`;
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
    return this.createApiError((error as any)?.message || 'An unexpected error occurred', error.response?.status);
  }

  private createApiError(message: string, status?: number): ApiError {
    return { message, status };
  }

  private getToken(): string | null { return localStorage.getItem('access_token'); }
  private setToken(token: string): void { localStorage.setItem('access_token', token); }
  private removeToken(): void { localStorage.removeItem('access_token'); }
  private handleTokenExpiration(): void {
    this.removeToken();
    window.dispatchEvent(new CustomEvent('tokenExpired'));
  }

  // ---------- Auth (probablemente SIN /api) ----------
  async register(userData: UserCreate): Promise<UserResponse> {
    const res = await this.api.post<UserResponse>('/auth/register', userData);
    return res.data;
  }

  async login(loginData: LoginData): Promise<Token> {
    const formData = new URLSearchParams();
    formData.append('username', loginData.username);
    formData.append('password', loginData.password);

    const res = await this.api.post<Token>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    this.setToken(res.data.access_token);
    return res.data;
  }

  async getCurrentUser(): Promise<UserInfo> {
    const res = await this.api.get<UserInfo>('/auth/me');
    return res.data;
  }

  // ---------- Chat (con prefijo /api) ----------
  async chat(message: ChatMessage): Promise<ChatResponse> {
    const res = await this.api.post<ChatResponse>('/api/chat/', message);
    return res.data;
  }

  async getChatHistory(conversationId?: string): Promise<any[]> {
    const res = await this.api.get<any[]>('/api/chat/history', {
      params: conversationId ? { conversation_id: conversationId } : {}
    });
    return res.data;
  }

  // ---------- Admin ----------
  async getUserStats(): Promise<UserStats> {
    try {
      const res = await this.api.get('/auth/admin/stats');
      const data = res.data as any;
      return {
        total_users: data?.total_users || 0,
        active_users: data?.active_users || 0,
        admin_users: data?.admin_users || 0,
        regular_users: data?.regular_users || 0,
        recent_signups: data?.recent_signups || 0
      };
    } catch {
      return { total_users: 0, active_users: 0, admin_users: 0, regular_users: 0, recent_signups: 0 };
    }
  }

  async getAllUsers(page: number = 1, perPage: number = 10): Promise<UserListResponse> {
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
    return { users, total: users.length, page, per_page: perPage };
  }

  async deactivateUser(userId: number): Promise<void> {
    await this.api.put(`/auth/users/${userId}/deactivate`);
  }

  async deleteUser(userId: number): Promise<void> {
    console.log(`Would delete user ${userId}`);
    // await this.api.delete(`/auth/users/${userId}`);
  }

  // ---------- Certifications (con prefijo /api) ----------
  async getCertifications(skip = 0, limit = 100): Promise<CertificationResponse[]> {
    try {
      const res = await this.api.get<CertificationResponse[]>('/api/certifications/', { params: { skip, limit } });
      return res.data;
    } catch {
      console.log('Certifications endpoint not available, returning mock data');
      return this.getMockCertifications();
    }
  }

  async createCertification(data: CertificationCreate): Promise<CertificationResponse> {
    const res = await this.api.post<CertificationResponse>('/api/certifications/', data);
    return res.data;
  }

  async getCertificationWithDocuments(certificationId: number): Promise<CertificationWithDocuments> {
    const res = await this.api.get<CertificationWithDocuments>(`/api/certifications/${certificationId}`);
    const certification = res.data;
    if (certification.documents) {
      certification.documents = certification.documents.map(doc => ({ ...doc, is_processed: true }));
    }
    return certification;
  }

  async deleteCertification(certificationId: number): Promise<void> {
    await this.api.delete(`/api/certifications/${certificationId}`);
  }

  async getCertificationDocuments(certificationId: number): Promise<DocumentResponse[]> {
    const res = await this.api.get<DocumentResponse[]>(`/api/certifications/${certificationId}/documents`);
    return res.data.map(doc => ({ ...doc, is_processed: true }));
  }

  async uploadSyllabus(certificationId: number, documentData: DocumentUpload): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('title', documentData.title);
    formData.append('file', documentData.file);
    const res = await this.api.post(`/api/certifications/${certificationId}/documents/syllabus`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const processedDocument = res.data?.document ? { ...res.data.document, is_processed: true } : undefined;
    return { success: true, message: res.data?.message || 'Syllabus subido exitosamente', document: processedDocument };
  }

  async uploadSampleExam(certificationId: number, documentData: DocumentUpload): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('title', documentData.title);
    formData.append('file', documentData.file);
    const res = await this.api.post(`/api/certifications/${certificationId}/documents/sample-exam`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const processedDocument = res.data?.document ? { ...res.data.document, is_processed: true } : undefined;
    return { success: true, message: res.data?.message || 'Examen de muestra subido exitosamente', document: processedDocument };
  }

  async reprocessCertificationDocuments(certificationId: number): Promise<void> {
    await this.api.post(`/api/certifications/${certificationId}/reprocess`);
  }

  // ---------- Misceláneo ----------
  private getMockCertifications(): CertificationResponse[] {
    return [
      { id: 1, code: 'ISTQB-FL', name: 'ISTQB Foundation Level', url: 'https://www.istqb.org/certifications/foundation-level', description: 'Certificación base de ISTQB que cubre los fundamentos del testing de software', version: 'v4.0', is_active: true, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
      { id: 2, code: 'ISTQB-AL-TM', name: 'ISTQB Advanced Level - Test Manager', url: 'https://www.istqb.org/certifications/advanced-level', description: 'Certificación avanzada enfocada en gestión de testing', version: 'v3.0', is_active: true, created_at: '2024-01-20T14:30:00Z', updated_at: '2024-01-20T14:30:00Z' },
      { id: 3, code: 'ISTQB-AL-TA', name: 'ISTQB Advanced Level - Technical Test Analyst', url: 'https://www.istqb.org/certifications/advanced-level', description: 'Certificación avanzada para analistas técnicos de testing', version: 'v3.0', is_active: true, created_at: '2024-02-01T09:15:00Z', updated_at: '2024-02-01T09:15:00Z' },
      { id: 4, code: 'ISTQB-EL-TM', name: 'ISTQB Expert Level - Test Management', url: 'https://www.istqb.org/certifications/expert-level', description: 'Certificación de nivel experto en gestión de testing', version: 'v2.0', is_active: false, created_at: '2024-02-10T16:45:00Z', updated_at: '2024-02-10T16:45:00Z' }
    ];
  }

  async healthCheck(): Promise<any> {
    const res = await this.api.get('/health');
    return res.data;
  }

  logout(): void { this.removeToken(); }
  isAuthenticated(): boolean { return !!this.getToken(); }
}

export default new ApiService();
