import React, { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, Award } from 'lucide-react';
import { CertificationResponse } from '../types/api';
import apiService from '../services/api';
import { cn } from '../utils/cn';

interface CertificationSelectorProps {
  selectedCertification: string | null;
  onCertificationSelect: (code: string | null) => void;
}

export const CertificationSelector: React.FC<CertificationSelectorProps> = ({
  selectedCertification,
  onCertificationSelect
}) => {
  const [certifications, setCertifications] = useState<CertificationResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getCertifications();
      setCertifications(response.filter(cert => cert.is_active));
    } catch (error: any) {
      console.error('Error loading certifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertificationSelect = (code: string | null) => {
    onCertificationSelect(code);
    setIsOpen(false);
  };

  const selectedCert = certifications.find(cert => cert.code === selectedCertification);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
          selectedCertification ? "border-blue-300 bg-blue-50" : ""
        )}
      >
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            selectedCertification ? "bg-blue-500" : "bg-gray-400"
          )}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {selectedCert ? selectedCert.code : 'Todas las certificaciones'}
              </span>
              {selectedCertification && (
                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                  General
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {selectedCert ? 'Certificación activa para el contexto del chat' : 'Selecciona una certificación específica'}
            </p>
          </div>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-400 transition-transform",
          isOpen ? "transform rotate-180" : ""
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {/* All Certifications Option */}
            <button
              onClick={() => handleCertificationSelect(null)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left hover:bg-gray-50 transition-colors",
                !selectedCertification ? "bg-blue-50 text-blue-700" : "text-gray-700"
              )}
            >
              <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">Todas las certificaciones</div>
                <div className="text-xs text-gray-500">Conocimiento general de ISTQB</div>
              </div>
            </button>

            {/* Loading State */}
            {isLoading && (
              <div className="px-3 py-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Cargando certificaciones...</p>
              </div>
            )}

            {/* Certifications List */}
            {!isLoading && certifications.map((cert) => (
              <button
                key={cert.id}
                onClick={() => handleCertificationSelect(cert.code)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left hover:bg-gray-50 transition-colors",
                  selectedCertification === cert.code ? "bg-blue-50 text-blue-700" : "text-gray-700"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  getLevelColor(cert.name)
                )}>
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{cert.name}</div>
                  <div className="text-xs text-gray-500">{cert.code}</div>
                  {cert.version && (
                    <div className="text-xs text-gray-400">Versión {cert.version}</div>
                  )}
                </div>
              </button>
            ))}

            {!isLoading && certifications.length === 0 && (
              <div className="px-3 py-4 text-center">
                <Award className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No hay certificaciones disponibles</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getLevelColor = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('foundation')) return 'bg-blue-500';
  if (lowerName.includes('advanced')) return 'bg-purple-500';
  if (lowerName.includes('expert')) return 'bg-red-500';
  if (lowerName.includes('specialist')) return 'bg-green-500';
  return 'bg-gray-500';
};