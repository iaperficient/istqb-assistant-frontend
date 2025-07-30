import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  Trash2, 
  RefreshCw,
  Award,
  FileText,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import { CertificationResponse, CertificationWithDocuments } from '../types/api';
import apiService from '../services/api';
import { CreateCertificationModal } from './CreateCertificationModal';
import { UploadDocumentModal } from './UploadDocumentModal';
import { CertificationDetailModal } from './CertificationDetailModal';

export const CertificationManagement: React.FC = () => {
  const [certifications, setCertifications] = useState<CertificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCertificationId, setSelectedCertificationId] = useState<number | null>(null);
  const [selectedCertificationName, setSelectedCertificationName] = useState('');
  const [uploadDocumentType, setUploadDocumentType] = useState<'syllabus' | 'sample_exam'>('syllabus');
  
  // Detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<CertificationWithDocuments | null>(null);

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

  const handleUploadDocument = (certificationId: number, certificationName: string, documentType: 'syllabus' | 'sample_exam') => {
    setSelectedCertificationId(certificationId);
    setSelectedCertificationName(certificationName);
    setUploadDocumentType(documentType);
    setIsUploadModalOpen(true);
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

  const filteredCertifications = certifications.filter(cert =>
    cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getLevelBadgeColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('foundation')) return 'bg-blue-100 text-blue-800';
    if (lowerName.includes('advanced')) return 'bg-purple-100 text-purple-800';
    if (lowerName.includes('expert')) return 'bg-red-100 text-red-800';
    if (lowerName.includes('specialist')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const extractLevel = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('foundation')) return 'Foundation';
    if (lowerName.includes('advanced')) return 'Advanced';
    if (lowerName.includes('expert')) return 'Expert';
    if (lowerName.includes('specialist')) return 'Specialist';
    return 'General';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Cargando certificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{certifications.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {certifications.filter(c => c.is_active).length}
              </p>
              <p className="text-sm text-gray-600">Activas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Documentos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full mr-4">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Procesando</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Certifications Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900">Certificaciones ISTQB</h3>
            
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

              {/* Refresh Button */}
              <button
                onClick={loadCertifications}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualizar lista"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Add Certification Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Certificación
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredCertifications.length === 0 ? (
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
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {certification.code}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(certification.name)}`}>
                            {extractLevel(certification.name)}
                          </span>
                          {getStatusIcon(certification.is_active)}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {certification.name}
                        </h4>
                        {certification.version && (
                          <p className="text-sm text-gray-500">
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
                                onClick={() => {
                                  window.open(certification.url, '_blank');
                                  setActionMenuOpen(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <ExternalLink className="w-4 h-4 mr-3" />
                                Abrir URL
                              </button>
                              <button
                                onClick={() => handleUploadDocument(certification.id, certification.name, 'syllabus')}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <FileText className="w-4 h-4 mr-3" />
                                Subir Syllabus
                              </button>
                              <button
                                onClick={() => handleUploadDocument(certification.id, certification.name, 'sample_exam')}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Upload className="w-4 h-4 mr-3" />
                                Subir Examen
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

                    <div className="text-xs text-gray-500 mb-3">
                      Creada: {new Date(certification.created_at).toLocaleDateString('es-ES')}
                    </div>

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
                        Ver Documentos →
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
          setIsCreateModalOpen(false);
        }}
      />

      {/* Upload Document Modal */}
      {selectedCertificationId && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedCertificationId(null);
            setSelectedCertificationName('');
          }}
          onSuccess={() => {
            loadCertifications();
            setIsUploadModalOpen(false);
            setSelectedCertificationId(null);
            setSelectedCertificationName('');
            // Refresh detail modal if open
            if (selectedCertification && selectedCertification.id === selectedCertificationId) {
              handleViewDetails(selectedCertificationId);
            }
          }}
          certificationId={selectedCertificationId}
          certificationName={selectedCertificationName}
          documentType={uploadDocumentType}
        />
      )}

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
          onUploadDocument={handleUploadDocument}
        />
      )}
    </div>
  );
};