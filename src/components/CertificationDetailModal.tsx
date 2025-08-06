import React from 'react';
import { X, Award, ExternalLink, FileText, Upload, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { CertificationWithDocuments } from '../types/api';

interface CertificationDetailModalProps {
  certification: CertificationWithDocuments;
  isOpen: boolean;
  onClose: () => void;
  onDocumentsChanged: () => void;
  onUploadDocument: (certificationId: number, certificationName: string, documentType: 'syllabus' | 'sample_exam') => void;
}

export const CertificationDetailModal: React.FC<CertificationDetailModalProps> = ({
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

  const getDocumentTypeBadgeColor = (type: 'syllabus' | 'sample_exam') => {
    return type === 'syllabus' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  if (!isOpen) return null;

  const syllabusDocuments = certification.documents.filter(doc => doc.document_type === 'syllabus');
  const sampleExamDocuments = certification.documents.filter(doc => doc.document_type === 'sample_exam');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
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
              
              <div className="mt-4 space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Code:</span>
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
                        <span className="font-medium text-gray-600">Version:</span>
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
                      <span className="font-medium text-gray-600">Description:</span>
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
                      View official page
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>

                {/* Documents Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Syllabus</h4>
                        <p className="text-2xl font-bold text-blue-700">{syllabusDocuments.length}</p>
                        <p className="text-xs text-blue-600">documento(s)</p>
                      </div>
                      <button
                        onClick={() => onUploadDocument(certification.id, certification.name, 'syllabus')}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                        title="Subir Syllabus"
                      >
                        <Upload className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-green-900">Sample Exams</h4>
                        <p className="text-2xl font-bold text-green-700">{sampleExamDocuments.length}</p>
                        <p className="text-xs text-green-600">documento(s)</p>
                      </div>
                      <button
                        onClick={() => onUploadDocument(certification.id, certification.name, 'sample_exam')}
                        className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors"
                        title="Subir Examen de Muestra"
                      >
                        <Upload className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Documentos ({certification.documents.length})
                    </h4>
                    <button
                      onClick={onDocumentsChanged}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      title="Actualizar lista"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {certification.documents.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No hay documentos subidos</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Start by uploading a syllabus and sample exams
                      </p>
                      <div className="mt-4 space-x-2">
                        <button
                          onClick={() => onUploadDocument(certification.id, certification.name, 'syllabus')}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Subir Syllabus
                        </button>
                        <button
                          onClick={() => onUploadDocument(certification.id, certification.name, 'sample_exam')}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Award className="w-3 h-3 mr-1" />
                          Subir Examen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {certification.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            {getDocumentTypeIcon(doc.document_type)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeBadgeColor(doc.document_type)}`}>
                                  {getDocumentTypeLabel(doc.document_type)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {doc.original_filename && `${doc.original_filename} • `}
                                Subido el {new Date(doc.created_at).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              {doc.is_processed ? (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  <span className="text-xs">Procesado</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-yellow-600">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span className="text-xs">Procesando</span>
                                </div>
                              )}
                            </div>
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
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={onClose}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => onUploadDocument(certification.id, certification.name, 'syllabus')}
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