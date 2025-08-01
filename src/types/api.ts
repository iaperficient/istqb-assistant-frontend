export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  username: string;
  email: string;
  id: number;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

export interface ChatMessage {
  message: string;
  context?: string;
  certification_code?: string;
  conversation_id?: string;
}

export interface RAGInfo {
  retrieval_successful: boolean;
  context_used: boolean;
  num_sources: number;
  sources: string[];
}

export interface ChatResponse {
  response: string;
  usage?: Record<string, any>;
  rag_info?: RAGInfo;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface ApiError {
  message: string;
  status?: number;
}

// Certification types based on new API
export interface CertificationCreate {
  code: string;
  name: string;
  url: string;
  description?: string;
  version?: string;
}

export interface CertificationResponse {
  id: number;
  code: string;
  name: string;
  url: string;
  description?: string;
  version?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CertificationWithDocuments {
  id: number;
  code: string;
  name: string;
  url: string;
  description?: string;
  version?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  documents: DocumentResponse[];
}

export interface DocumentResponse {
  id: number;
  title: string;
  document_type: 'syllabus' | 'sample_exam';
  certification_id: number;
  file_path?: string;
  original_filename?: string;
  content_hash: string;
  is_processed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DocumentUpload {
  title: string;
  file: File;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  document?: DocumentResponse;
  is_duplicate?: boolean;
  existing_document?: DocumentResponse;
}

// Legacy types for backward compatibility
export interface ProcessedCertification {
  id: number;
  title: string;
  level: string;
  url: string;
  status: 'completed' | 'processing' | 'failed';
  document_count?: number;
  created_at: string;
}

export interface CertificationContextType {
  selectedCertification: ProcessedCertification | null;
  certifications: ProcessedCertification[];
  isLoading: boolean;
  error: string | null;
  selectCertification: (certification: ProcessedCertification | null) => void;
  refreshCertifications: () => Promise<void>;
}

// User Management Types
export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
}

export interface UserListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  regular_users: number;
  recent_signups: number;
}
