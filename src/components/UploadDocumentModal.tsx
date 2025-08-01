import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../services/api';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  certificationId: number;
  certificationName: string;
  documentType: 'syllabus' | 'sample_exam';
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  certificationId,
  certificationName,
  documentType
}) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const documentTypeLabel = documentType === 'syllabus' ? 'Syllabus' : 'Examen de Muestra';
  const documentTypeIcon = documentType === 'syllabus' ? FileText : CheckCircle;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!file) {
      setError('Debe seleccionar un archivo PDF');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('El archivo no debe superar los 10MB');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let result;
      if (documentType === 'syllabus') {
        result = await apiService.uploadSyllabus(certificationId, { title: title.trim(), file });
      } else {
        result = await apiService.uploadSampleExam(certificationId, { title: title.trim(), file });
      }
      
      if (result && result.success === false) {
        // Explicitly check for false, not just falsy
        setError(result.message || `Error al subir ${documentTypeLabel.toLowerCase()}`);
        toast.error(result.message || `Error al subir ${documentTypeLabel.toLowerCase()}`);
        return;
      }
      
      // Show success message - use the message from the result if available
      const successMessage = result?.message || `${documentTypeLabel} subido exitosamente`;
      toast.success(successMessage);
      handleClose();
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.message || `Error al subir ${documentTypeLabel.toLowerCase()}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setFile(null);
      setError('');
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
        if (!title) {
          setTitle(droppedFile.name.replace('.pdf', ''));
        }
        setError('');
      } else {
        setError('Solo se permiten archivos PDF');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        if (!title) {
          setTitle(selectedFile.name.replace('.pdf', ''));
        }
        setError('');
      } else {
        setError('Solo se permiten archivos PDF');
      }
    }
  };

  if (!isOpen) return null;

  const Icon = documentTypeIcon;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
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
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Subir {documentTypeLabel}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Sube un archivo PDF del {documentTypeLabel.toLowerCase()} para la certificación "{certificationName}".
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                {/* Title Field */}
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título del Documento *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      className={`block w-full px-3 py-2 border ${
                        error && !title.trim() ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder={`Título del ${documentTypeLabel.toLowerCase()}`}
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setError('');
                      }}
                      disabled={isLoading}
                      maxLength={200}
                    />
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo PDF *
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : file 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isLoading}
                    />
                    
                    <div className="text-center">
                      {file ? (
                        <>
                          <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Haz clic o arrastra otro archivo para reemplazar
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium text-blue-600 hover:text-blue-500">
                                Haz clic para subir
                              </span>{' '}
                              o arrastra y suelta
                            </p>
                            <p className="text-xs text-gray-500">
                              Solo archivos PDF hasta 10MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {error}
                  </div>
                )}

                {/* Info box */}
                <div className="mb-6 bg-blue-50 rounded-md p-4">
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
                          <li>El documento se procesará automáticamente para el sistema RAG</li>
                          {documentType === 'syllabus' && (
                            <li>Solo se puede subir un syllabus por certificación</li>
                          )}
                          {documentType === 'sample_exam' && (
                            <li>Puedes subir múltiples exámenes de muestra</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isLoading || !title.trim() || !file}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        Subir {documentTypeLabel}
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