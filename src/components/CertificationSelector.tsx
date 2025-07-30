import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Award, Sparkles, RefreshCw, CheckCircle } from 'lucide-react';
import { useCertificationContext } from '../contexts/CertificationContext';
import { ProcessedCertification } from '../types/api';

const CertificationSelector: React.FC = () => {
  const {
    certifications,
    selectedCertification,
    isLoading,
    selectCertification,
    refreshCertifications
  } = useCertificationContext();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar certificaciones basado en búsqueda
  const filteredCertifications = certifications.filter(cert =>
    cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCertificationSelect = (certification: ProcessedCertification) => {
    selectCertification(certification);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'Foundation': 'bg-green-100 text-green-800 border-green-200',
      'Advanced': 'bg-blue-100 text-blue-800 border-blue-200',
      'Expert': 'bg-purple-100 text-purple-800 border-purple-200',
      'Specialist': 'bg-orange-100 text-orange-800 border-orange-200',
      'General': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[level as keyof typeof colors] || colors.General;
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Foundation':
        return '🎯';
      case 'Advanced':
        return '🚀';
      case 'Expert':
        return '👑';
      case 'Specialist':
        return '🔧';
      default:
        return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
        <span className="text-sm text-gray-600">Cargando certificaciones...</span>
      </div>
    );
  }

  if (certifications.length === 0) {
    return (
      <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-800">No hay certificaciones disponibles</span>
        </div>
        <button
          onClick={refreshCertifications}
          className="text-amber-600 hover:text-amber-700 transition-colors"
          title="Actualizar certificaciones"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {selectedCertification ? selectedCertification.title : 'Seleccionar Certificación'}
              </span>
              {selectedCertification && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getLevelColor(selectedCertification.level)}`}>
                  {getLevelIcon(selectedCertification.level)} {selectedCertification.level}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {selectedCertification 
                ? 'Certificación activa para el contexto del chat'
                : 'Elige una certificación para personalizar las respuestas'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedCertification && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          <ChevronDown 
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Buscar certificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {/* Opción "Sin certificación específica" */}
            <button
              onClick={() => handleCertificationSelect(null as any)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                !selectedCertification ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                  <span className="text-sm">🌐</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      Conocimiento General
                    </span>
                    {!selectedCertification && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Usar todo el conocimiento disponible sin filtrar
                  </p>
                </div>
              </div>
            </button>

            {/* Lista de certificaciones */}
            {filteredCertifications.map((certification) => (
              <button
                key={certification.id}
                onClick={() => handleCertificationSelect(certification)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                  selectedCertification?.id === certification.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <span className="text-sm">{getLevelIcon(certification.level)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {certification.title}
                      </span>
                      {selectedCertification?.id === certification.id && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getLevelColor(certification.level)}`}>
                        {certification.level}
                      </span>
                      {certification.document_count && (
                        <span className="text-xs text-gray-500">
                          {certification.document_count} documentos
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {filteredCertifications.length === 0 && searchTerm && (
              <div className="px-4 py-8 text-center text-gray-500">
                <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No se encontraron certificaciones</p>
                <p className="text-xs">Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <button
              onClick={refreshCertifications}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar lista</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationSelector;