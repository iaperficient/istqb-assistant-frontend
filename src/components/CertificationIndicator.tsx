import React from 'react';
import { Award, Sparkles, X } from 'lucide-react';
import { useCertificationContext } from '../contexts/CertificationContext';

const CertificationIndicator: React.FC = () => {
  const { selectedCertification, selectCertification } = useCertificationContext();

  if (!selectedCertification) {
    return null;
  }

  const getLevelColor = (level: string) => {
    const colors = {
      'Foundation': 'bg-green-50 border-green-200 text-green-800',
      'Advanced': 'bg-blue-50 border-blue-200 text-blue-800',
      'Expert': 'bg-purple-50 border-purple-200 text-purple-800',
      'Specialist': 'bg-orange-50 border-orange-200 text-orange-800',
      'General': 'bg-gray-50 border-gray-200 text-gray-800'
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-2">
      <div className={`flex items-center justify-between p-3 rounded-lg border ${getLevelColor(selectedCertification.level)} backdrop-blur-sm`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-white/80 rounded-lg shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              Contexto activo:
            </span>
            <span className="text-sm font-semibold">
              {selectedCertification.title}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/60 border border-current/20">
              {getLevelIcon(selectedCertification.level)} {selectedCertification.level}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => selectCertification(null)}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-white/80 hover:bg-white transition-colors text-gray-600 hover:text-gray-800"
          title="Cambiar a contexto general"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CertificationIndicator;