import React, { useState } from 'react';
import { X, Award, Link2, FileText, Hash, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { CertificationCreate } from '../types/api';

interface CreateCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCertificationModal: React.FC<CreateCertificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CertificationCreate>({
    code: '',
    name: '',
    url: '',
    description: '',
    version: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    } else if (formData.code.length < 2) {
      newErrors.code = 'El código debe tener al menos 2 caracteres';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 5) {
      newErrors.name = 'El nombre debe tener al menos 5 caracteres';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'La URL es requerida';
    } else if (!/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = 'Debe ser una URL válida (http:// o https://)';
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
      const certificationData: CertificationCreate = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        url: formData.url.trim(),
        description: formData.description.trim() || undefined,
        version: formData.version.trim() || undefined
      };

      await apiService.createCertification(certificationData);
      toast.success(`Certificación "${formData.name}" creada exitosamente`);
      
      // Reset form
      setFormData({
        code: '',
        name: '',
        url: '',
        description: '',
        version: ''
      });
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear certificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        code: '',
        name: '',
        url: '',
        description: '',
        version: ''
      });
      setErrors({});
      onClose();
    }
  };

  const handleInputChange = (field: keyof CertificationCreate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const suggestCodeFromName = (name: string) => {
    // Extract acronym from name for code suggestion
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      const acronym = words
        .filter(word => word.length > 2) // Skip short words like "de", "la", etc.
        .map(word => word.charAt(0).toUpperCase())
        .join('');
      
      if (acronym.length >= 2 && acronym.length <= 6) {
        setFormData(prev => ({ 
          ...prev, 
          code: prev.code || acronym // Only suggest if code is empty
        }));
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
              <Award className="h-6 w-6 text-white" />
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Crear Nueva Certificación ISTQB
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Completa la información para agregar una nueva certificación al sistema.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Code and Version in same row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Code Field */}
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Código *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="code"
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          errors.code ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase`}
                        placeholder="ISTQB-FL"
                        value={formData.code}
                        onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                        disabled={isLoading}
                        maxLength={20}
                      />
                    </div>
                    {errors.code && (
                      <div className="mt-1 flex items-center text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.code}
                      </div>
                    )}
                  </div>

                  {/* Version Field */}
                  <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                      Versión
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="version"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="v4.0, 2024, etc."
                        value={formData.version}
                        onChange={(e) => handleInputChange('version', e.target.value)}
                        disabled={isLoading}
                        maxLength={20}
                      />
                    </div>
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre Completo *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="ISTQB Foundation Level"
                      value={formData.name}
                      onChange={(e) => {
                        handleInputChange('name', e.target.value);
                        suggestCodeFromName(e.target.value);
                      }}
                      disabled={isLoading}
                      maxLength={200}
                    />
                  </div>
                  {errors.name && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </div>
                  )}
                </div>

                {/* URL Field */}
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    URL Oficial *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="url"
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.url ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="https://www.istqb.org/certifications/..."
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.url && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.url}
                    </div>
                  )}
                </div>

                {/* Description Field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="description"
                      rows={3}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Descripción breve de la certificación..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={isLoading}
                      maxLength={500}
                    />
                  </div>
                </div>

                {/* Help text */}
                <div className="bg-blue-50 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Próximos pasos
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Después de crear la certificación, podrás subir el syllabus (obligatorio)</li>
                          <li>También podrás agregar uno o varios exámenes de muestra</li>
                          <li>Los documentos se procesarán automáticamente para el sistema RAG</li>
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
                        Creando...
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Crear Certificación
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