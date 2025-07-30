import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ProcessedCertification, CertificationContextType } from '../types/api';
import apiService from '../services/api';
import { toast } from 'react-toastify';

const CertificationContext = createContext<CertificationContextType | undefined>(undefined);

export const useCertificationContext = () => {
  const context = useContext(CertificationContext);
  if (context === undefined) {
    throw new Error('useCertificationContext must be used within a CertificationProvider');
  }
  return context;
};

interface CertificationProviderProps {
  children: ReactNode;
}

export const CertificationProvider: React.FC<CertificationProviderProps> = ({ children }) => {
  const [certifications, setCertifications] = useState<ProcessedCertification[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<ProcessedCertification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCertifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Usar la nueva API para obtener certificaciones
      const certifications = await apiService.getCertifications();
      
      // Transformar la respuesta del API al formato esperado para compatibilidad
      const processedCerts: ProcessedCertification[] = certifications.map((cert) => ({
        id: cert.id,
        title: cert.name,
        level: extractLevelFromTitle(cert.name),
        url: cert.url,
        status: cert.is_active ? 'completed' : 'failed',
        document_count: 0, // Se podría obtener de los documentos si es necesario
        created_at: cert.created_at
      }));

      setCertifications(processedCerts);
      
      // Auto-seleccionar la primera certificación si no hay ninguna seleccionada
      if (!selectedCertification && processedCerts.length > 0) {
        setSelectedCertification(processedCerts[0]);
      }
    } catch (error: any) {
      // Si la nueva API falla, intentar con la legacy
      try {
        const response = await apiService.getProcessedCertifications();
        const processedCerts: ProcessedCertification[] = response.certifications?.map((cert: any) => ({
          id: cert.id,
          title: cert.title || extractTitleFromUrl(cert.url),
          level: extractLevelFromTitle(cert.title || cert.url),
          url: cert.url,
          status: cert.status,
          document_count: cert.document_count,
          created_at: cert.created_at
        })) || [];

        setCertifications(processedCerts);
        
        if (!selectedCertification && processedCerts.length > 0) {
          setSelectedCertification(processedCerts[0]);
        }
      } catch (legacyError: any) {
        setError(legacyError.message || 'Error al cargar certificaciones');
        console.error('Error loading certifications:', legacyError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectCertification = (certification: ProcessedCertification | null) => {
    setSelectedCertification(certification);
    // Guardar en localStorage para persistencia
    if (certification) {
      localStorage.setItem('selectedCertificationId', certification.id.toString());
    } else {
      localStorage.removeItem('selectedCertificationId');
    }
  };

  const refreshCertifications = async () => {
    await loadCertifications();
    toast.success('Certificaciones actualizadas');
  };

  // Funciones auxiliares para extraer información del título/URL
  const extractTitleFromUrl = (url: string): string => {
    // Extraer título básico de la URL de ISTQB
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    return lastPart
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\.html?$/i, '') || 'Certificación ISTQB';
  };

  const extractLevelFromTitle = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('foundation')) return 'Foundation';
    if (lowerTitle.includes('advanced')) return 'Advanced';
    if (lowerTitle.includes('expert')) return 'Expert';
    if (lowerTitle.includes('specialist')) return 'Specialist';
    return 'General';
  };

  // Cargar certificaciones al montar el componente
  useEffect(() => {
    loadCertifications();
  }, []);

  // Restaurar certificación seleccionada desde localStorage
  useEffect(() => {
    const savedCertificationId = localStorage.getItem('selectedCertificationId');
    if (savedCertificationId && certifications.length > 0) {
      const savedCert = certifications.find(cert => cert.id.toString() === savedCertificationId);
      if (savedCert) {
        setSelectedCertification(savedCert);
      }
    }
  }, [certifications]);

  const value: CertificationContextType = {
    certifications,
    selectedCertification,
    isLoading,
    error,
    selectCertification,
    refreshCertifications: refreshCertifications,
  };

  return (
    <CertificationContext.Provider value={value}>
      {children}
    </CertificationContext.Provider>
  );
};