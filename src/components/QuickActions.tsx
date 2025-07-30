import React from 'react';
import { BookOpen, FileText, Brain, HelpCircle, Target, Zap } from 'lucide-react';
import { useCertificationContext } from '../contexts/CertificationContext';

interface QuickActionsProps {
  onQuickAction: (message: string, context?: string) => void;
  disabled?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuickAction, disabled = false }) => {
  const { selectedCertification } = useCertificationContext();

  const getQuickActions = () => {
    const baseActions = [
      {
        id: 'syllabus',
        label: 'Ver Syllabus',
        icon: BookOpen,
        message: selectedCertification 
          ? `Muéstrame el syllabus completo de ${selectedCertification.title}. Incluye los objetivos de aprendizaje y temas principales.`
          : 'Muéstrame información sobre los syllabus disponibles de ISTQB.',
        gradient: 'from-blue-500 to-blue-600',
        hoverGradient: 'from-blue-600 to-blue-700',
      },
      {
        id: 'test',
        label: 'Generar Test',
        icon: Brain,
        message: selectedCertification
          ? `Genera un test de práctica de 10 preguntas sobre ${selectedCertification.title}. Incluye preguntas de diferentes niveles de dificultad.`
          : 'Genera un test de práctica general sobre conceptos de testing de software.',
        gradient: 'from-green-500 to-green-600',
        hoverGradient: 'from-green-600 to-green-700',
      },
      {
        id: 'concepts',
        label: 'Conceptos Clave',
        icon: Target,
        message: selectedCertification
          ? `Explícame los conceptos más importantes de ${selectedCertification.title} que debo dominar para el examen.`
          : 'Explícame los conceptos fundamentales de testing de software según ISTQB.',
        gradient: 'from-purple-500 to-purple-600',
        hoverGradient: 'from-purple-600 to-purple-700',
      },
      {
        id: 'exam-tips',
        label: 'Tips de Examen',
        icon: Zap,
        message: selectedCertification
          ? `Dame consejos y estrategias específicas para aprobar el examen de ${selectedCertification.title}.`
          : 'Dame consejos generales para preparar exámenes de certificación ISTQB.',
        gradient: 'from-orange-500 to-orange-600',
        hoverGradient: 'from-orange-600 to-orange-700',
      },
    ];

    return baseActions;
  };

  const handleQuickAction = (action: any) => {
    if (disabled) return;
    
    const context = selectedCertification 
      ? `certification:${selectedCertification.id}`
      : 'general';
    
    onQuickAction(action.message, context);
  };

  const actions = getQuickActions();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">Acciones Rápidas</span>
        </div>
        {selectedCertification && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {selectedCertification.title}
          </span>
        )}
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              disabled={disabled}
              className={`
                group relative overflow-hidden p-3 rounded-lg border border-gray-200 
                bg-gradient-to-r ${action.gradient} text-white
                hover:${action.hoverGradient} hover:shadow-md hover:scale-[1.02]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                transition-all duration-200 ease-out
              `}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              {/* Content */}
              <div className="relative flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium truncate">
                  {action.label}
                </span>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-white/30 transition-all duration-200" />
            </button>
          );
        })}
      </div>

      {/* Additional Quick Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            const message = selectedCertification
              ? `¿Cuáles son las preguntas más frecuentes sobre ${selectedCertification.title}?`
              : '¿Cuáles son las preguntas más frecuentes sobre certificaciones ISTQB?';
            const context = selectedCertification 
              ? `certification:${selectedCertification.id}`
              : 'general';
            onQuickAction(message, context);
          }}
          disabled={disabled}
          className="flex-1 flex items-center justify-center space-x-2 p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <HelpCircle className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">FAQ</span>
        </button>

        <button
          onClick={() => {
            const message = selectedCertification
              ? `Genera un resumen ejecutivo de ${selectedCertification.title} con los puntos más importantes.`
              : 'Dame un resumen general de las certificaciones ISTQB disponibles.';
            const context = selectedCertification 
              ? `certification:${selectedCertification.id}`
              : 'general';
            onQuickAction(message, context);
          }}
          disabled={disabled}
          className="flex-1 flex items-center justify-center space-x-2 p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">Resumen</span>
        </button>
      </div>

      {/* Context Indicator */}
      {!selectedCertification && (
        <div className="flex items-center space-x-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
            <span className="text-xs text-amber-800">!</span>
          </div>
          <span className="text-xs text-amber-800">
            Selecciona una certificación para obtener respuestas más específicas
          </span>
        </div>
      )}
    </div>
  );
};

export default QuickActions;