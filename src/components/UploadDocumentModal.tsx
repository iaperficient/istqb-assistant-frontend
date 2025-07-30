import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Award, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { DocumentUpload, DocumentResponse, CertificationWithDocuments } from '../types/api';

interface UploadDocumentModalProps {
  isOpen: boolean;
  certificationId: number;
  certificationName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  certificationId,
  certificationName,
  onClose,
  onSuccess
}) => {
  const [documentType, setDocumentType] = useState<'syllabus' | 'sample_exam'>('syllabus');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState<DocumentResponse[]>([]);
  const [hasSyllabus, setHasSyllabus] = useState(false);

  // Cargar documentos existentes cuando se abre el modal
  useEffect(() => {
    if (isOpen && certificationId) {
      loadExistingDocuments();
    }
  }, [isOpen, certificationId]);

  const loadExistingDocuments = async () => {
    try {
      const documents = await apiService.getCertificationDocuments(certificationId);
      setExistingDocuments(documents);
      
      // Verificar si ya hay un syllabus
      const syllabusExists = documents.some(doc => doc.document_type === 'syllabus');
      setHasSyllabus(syllabusExists);
      
      // Si ya hay syllabus, cambiar por defecto a sample_exam
      if (syllabusExists) {
        setDocumentType('sample_exam');
      }
    } catch (error) {
      console.error('Error loading existing documents:', error);
    }
  };

  const documentTypes = [
    {
      value: 'syllabus' as const,
      label: 'Syllabus',
      description: hasSyllabus 
        ? 'Ya existe un syllabus para esta certificación' 
        : 'Documento de syllabus oficial de la certificación',
      icon: FileText,
      color: 'blue',
      disabled: hasSyllabus
    },
    {
      value: 'sample_exam' as const,
      label: 'Examen de Muestra',
      description: 'Examen de práctica o muestra oficial (se pueden subir múltiples)',
      icon: Award,
      color: 'green',
      disabled: false
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (title.length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    }

    if (!file) {
      newErrors.file = 'Debes seleccionar un archivo';
    } else if (file.type !== 'application/pdf') {
      newErrors.file = 'Solo se permiten archivos PDF';
    } else if (file.size > 10 * 1024 * 1024) { // 10MB
      newErrors.file = 'El archivo es demasiado grande (máximo 10MB)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const documentData: DocumentUpload = {
        title: title.trim(),
        file: file!
      };

      let result;
      if (documentType === 'syllabus') {
        result = await apiService.uploadSyllabus(certificationId, documentData);
      } else {
        result = await apiService.uploadSampleExam(certificationId, documentData);
      }

      if (result.success) {
        const docTypeLabel = documentTypes.find(t => t.value === documentType)?.label;
        toast.success(`${docTypeLabel} subido exitosamente`);
        
        // Reset form
        setTitle('');
        setFile(null);
        setDocumentType(hasSyllabus ? 'sample_exam' : 'syllabus');
        setErrors({});
        
        onSuccess?.();
        onClose();
      } else if (result.is_duplicate) {
        // Manejar documento duplicado
        const docTypeLabel = documentTypes.find(t => t.value === documentType)?.label;
        toast.warning(
          `⚠️ ${docTypeLabel} ya existente: Este documento ya fue subido anteriormente.`,
          {
            autoClose: 5000,
            position: 'top-center'
          }
        );
        
        // Mostrar información del documento existente si está disponible
        if (result.existing_document) {
          const existingDoc = result.existing_document;
          toast.info(
            `📄 Documento existente: "${existingDoc.title}" (subido el ${new Date(existingDoc.created_at).toLocaleDateString('es-ES')})`,
            {
              autoClose: 7000,
              position: 'top-center'
            }
          );
        }
        
        // No cerrar el modal para que el usuario pueda intentar con otro archivo
        setFile(null);
        setErrors({});
      } else {
        toast.error(result.message || 'Error al subir documento');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al subir documento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setFile(null);
      setDocumentType(hasSyllabus ? 'sample_exam' : 'syllabus');
      setErrors({});
      setExistingDocuments([]);
      setHasSyllabus(false);
      onClose();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        // Auto-generate title from filename if empty
        if (!title) {
          const nameWithoutExt = droppedFile.name.replace(/\.pdf$/i, '');
          setTitle(nameWithoutExt);
        }
      } else {
        toast.error('Solo se permiten archivos PDF');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Auto-generate title from filename if empty
      if (!title) {
        const nameWithoutExt = selectedFile.name.replace(/\.pdf$/i, '');
        setTitle(nameWithoutExt);
      }
      // Clear file error
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleClose}
              disabled={isLoading}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 sm:mx-0 sm:h-10 sm:w-10">
              <Upload className="h-6 w-6 text-white" />
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Subir Documento
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Sube un documento para <strong>{certificationName}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {/* Document Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Documento
                  </label>
                  <div className="space-y-2">
                    {documentTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <label
                          key={type.value}
                          className={`relative flex items-center p-3 border rounded-lg ${
                            type.disabled 
                              ? 'cursor-not-allowed bg-gray-100 border-gray-200 opacity-60' 
                              : 'cursor-pointer hover:bg-gray-50'
                          } ${
                            documentType === type.value && !type.disabled
                              ? `border-${type.color}-500 bg-${type.color}-50`
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="documentType"
                            value={type.value}
                            checked={documentType === type.value}
                            onChange={(e) => setDocumentType(e.target.value as 'syllabus' | 'sample_exam')}
                            className="sr-only"
                            disabled={isLoading || type.disabled}
                          />
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${
                              type.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                type.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                              }`} />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {type.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {type.description}
                              </div>
                            </div>
                          </div>
                          {documentType === type.value && (
                            <div className="ml-auto">
                              <div className={`w-4 h-4 rounded-full ${
                                type.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                              }`}>
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>
                              </div>
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Title Field */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título del Documento
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      className={`block w-full px-3 py-2 border ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Ej: ISTQB Foundation Level Syllabus v4.0"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) {
                          setErrors(prev => ({ ...prev, title: '' }));
                        }
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.title && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title}
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo PDF
                  </label>
                  
                  <div
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                      dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : errors.file
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-1 text-center">
                      {file ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="h-8 w-8 text-red-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Sube un archivo</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".pdf"
                                onChange={handleFileSelect}
                                disabled={isLoading}
                              />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF hasta 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {file && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                      disabled={isLoading}
                    >
                      Quitar archivo
                    </button>
                  )}
                  
                  {errors.file && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.file}
                    </div>
                  )}
                </div>

                {/* Existing Documents Info */}
                {existingDocuments.length > 0 && (
                  <div className="bg-gray-50 rounded-md p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-800">
                          Documentos existentes ({existingDocuments.length})
                        </h3>
                        <div className="mt-2 space-y-1">
                          {existingDocuments.map((doc, index) => (
                            <div key={doc.id} className="flex items-center text-xs text-gray-600">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                doc.document_type === 'syllabus' ? 'bg-blue-500' : 'bg-green-500'
                              }`} />
                              <span className="font-medium">
                                {doc.document_type === 'syllabus' ? 'Syllabus' : 'Sample Exam'}:
                              </span>
                              <span className="ml-1">{doc.title}</span>
                              {doc.is_processed ? (
                                <CheckCircle className="w-3 h-3 text-green-500 ml-2" />
                              ) : (
                                <XCircle className="w-3 h-3 text-yellow-500 ml-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Help text */}
                <div className="bg-blue-50 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Información importante
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Solo se permiten archivos PDF</li>
                          <li>Tamaño máximo: 10MB</li>
                          <li>Solo se puede subir un syllabus por certificación</li>
                          <li>Se pueden subir múltiples exámenes de muestra</li>
                          <li>Se detectan automáticamente documentos duplicados</li>
                          <li>El documento será procesado automáticamente para el sistema RAG</li>
                          <li>El procesamiento puede tomar varios minutos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-medium text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Documento
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;