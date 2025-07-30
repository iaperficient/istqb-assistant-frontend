import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  FileText, 
  Upload, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { CertificationResponse, CertificationWithDocuments, DocumentResponse } from '../types/api';
import CreateCertificationModal from './CreateCertificationModal';
import UploadDocumentModal from './UploadDocumentModal';

interface CertificationListProps {
  onCreateCertification: () => void;
}

const CertificationList: React.FC<CertificationListProps> = ({ onCreateCertification }) => {
  const [certifications, setCertifications] = useState<CertificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [selectedCertification, setSelectedCertification] = useState<CertificationWithDocuments | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCertificationId, setUploadCertificationId] = useState<number | null>(null);
  const [uploadCertificationName, setUploadCertificationName] = useState<string>('');

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getCertifications();
      setCertifications(response);
    } catch (error: any) {
      toast.error('Error al cargar certificaciones');
      console.error('Error loading certifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCertification = async (certificationId: number, name: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la certificación "${name}"?`)) {
      try {
        await apiService.deleteCertification(certificationId);
        toast.success('Certificación eliminada exitosamente');
        loadCertifications();
      } catch (error: any) {
        toast.error('Error al eliminar certificación');
      }
    }
    setActionMenuOpen(null);
  };

  const handleViewDetails = async (certificationId: number) => {
    try {
      const certificationWithDocs = await apiService.getCertificationWithDocuments(certificationId);
      setSelectedCertification(certificationWithDocs);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      toast.error('Error al cargar detalles de la certificación');
    }
    setActionMenuOpen(null);
  };

  const handleReprocessDocuments = async (certificationId: number, name: string) => {
    if (window.confirm(`¿Reprocesar todos los documentos de "${name}"?`)) {
      try {
        await apiService.reprocessCertificationDocuments(certificationId);
        toast.success('Documentos enviados para reprocesamiento');
      } catch (error: any) {
        toast.error('Error al reprocesar documentos');
      }
    }
    setActionMenuOpen(null);
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const filteredCertifications = certifications.filter(cert =>
    cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-medium text-gray-900">Certificaciones ISTQB</h3>
              <button
                onClick={loadCertifications}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Actualizar lista"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar certificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Create Certification Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Certificación
              </button>
            </div>
          </div>
        </div>

        {/* Certifications Grid */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Cargando certificaciones...</p>
            </div>
          ) : filteredCertifications.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron certificaciones' : 'No hay certificaciones agregadas'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza agregando tu primera certificación ISTQB al sistema'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Certificación
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertifications.map((certification) => (
                <div
                  key={certification.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {certification.code}
                          </span>
                          {getStatusIcon(certification.is_active)}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {certification.name}
                        </h4>
                        {certification.version && (
                          <p className="text-sm text-gray-500 mt-1">
                            Versión: {certification.version}
                          </p>
                        )}
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === certification.id ? null : certification.id)}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {actionMenuOpen === certification.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => handleViewDetails(certification.id)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Eye className="w-4 h-4 mr-3" />
                                Ver Detalles
                              </button>
                              <button
                                onClick={() => window.open(certification.url, '_blank')}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <ExternalLink className="w-4 h-4 mr-3" />
                                Abrir URL
                              </button>
                              <button
                                onClick={() => handleReprocessDocuments(certification.id, certification.name)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <RefreshCw className="w-4 h-4 mr-3" />
                                Reprocesar
                              </button>
                              <button
                                onClick={() => handleDeleteCertification(certification.id, certification.name)}
                                className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {certification.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {certification.description}
                      </p>
                    )}

                    <div className="text-xs text-gray-500">
                      Creada: {new Date(certification.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        certification.is_active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {certification.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                      
                      <button
                        onClick={() => handleViewDetails(certification.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Ver documentos →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Certification Modal */}
      <CreateCertificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadCertifications();
        }}
      />

      {/* Certification Detail Modal */}
      {selectedCertification && (
        <CertificationDetailModal
          certification={selectedCertification}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedCertification(null);
          }}
          onDocumentsChanged={loadCertifications}
          onUploadDocument={(certificationId, certificationName) => {
            setUploadCertificationId(certificationId);
            setUploadCertificationName(certificationName);
            setIsUploadModalOpen(true);
          }}
        />
      )}

      {/* Upload Document Modal */}
      {uploadCertificationId && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          certificationId={uploadCertificationId}
          certificationName={uploadCertificationName}
          onClose={() => {
            setIsUploadModalOpen(false);
            setUploadCertificationId(null);
            setUploadCertificationName('');
          }}
          onSuccess={() => {
            loadCertifications();
            // Refresh detail modal if open
            if (selectedCertification && selectedCertification.id === uploadCertificationId) {
              handleViewDetails(uploadCertificationId);
            }
          }}
        />
      )}
    </div>
  );
};

// Certification Detail Modal Component
interface CertificationDetailModalProps {
  certification: CertificationWithDocuments;
  isOpen: boolean;
  onClose: () => void;
  onDocumentsChanged: () => void;
  onUploadDocument: (certificationId: number, certificationName: string) => void;
}

const CertificationDetailModal: React.FC<CertificationDetailModalProps> = ({
  certification,
  isOpen,
  onClose,
  onDocumentsChanged,
  onUploadDocument
}) => {
  const getDocumentTypeIcon = (type: 'syllabus' | 'sample_exam') => {
    return type === 'syllabus' ? (
      <FileText className="w-4 h-4 text-blue-500" />
    ) : (
      <Award className="w-4 h-4 text-green-500" />
    );
  };

  const getDocumentTypeLabel = (type: 'syllabus' | 'sample_exam') => {
    return type === 'syllabus' ? 'Syllabus' : 'Examen de Muestra';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {certification.name}
              </h3>
              
              <div className="mt-4 space-y-4">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Código:</span>
                      <span className="ml-2">{certification.code}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Estado:</span>
                      <span className={`ml-2 ${certification.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {certification.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    {certification.version && (
                      <div>
                        <span className="font-medium text-gray-600">Versión:</span>
                        <span className="ml-2">{certification.version}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-600">Creada:</span>
                      <span className="ml-2">{new Date(certification.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  
                  {certification.description && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-600">Descripción:</span>
                      <p className="mt-1 text-gray-700">{certification.description}</p>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <span className="font-medium text-gray-600">URL:</span>
                    <a 
                      href={certification.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center"
                    >
                      Ver página oficial
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Documentos ({certification.documents.length})
                  </h4>
                  
                  {certification.documents.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No hay documentos subidos</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Sube syllabus y exámenes de muestra para esta certificación
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {certification.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getDocumentTypeIcon(doc.document_type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                              <p className="text-xs text-gray-500">
                                {getDocumentTypeLabel(doc.document_type)} • 
                                {doc.original_filename}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {doc.is_processed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" title="Procesado" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-500" title="Procesando" />
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(doc.created_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => onUploadDocument(certification.id, certification.name)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documentos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationList;