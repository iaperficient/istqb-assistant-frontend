import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, BookOpen, FileText, Lightbulb, CheckCircle, HelpCircle, FileX, ChevronUp, ChevronDown } from 'lucide-react';
import { CertificationResponse } from '../types/api';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { cn } from '../utils/cn';

interface ChatInputProps {
  onSendMessage: (message: string, voiceInput?: boolean) => void;
  isLoading: boolean;
  placeholder?: string;
  selectedCertification?: string | null;
  onCertificationSelect?: (code: string | null) => void;
  onClearChat?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Pregunta sobre certificaciones ISTQB...",
  selectedCertification,
  onCertificationSelect,
  onClearChat
}) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [certifications, setCertifications] = useState<CertificationResponse[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      const response = await apiService.getCertifications();
      setCertifications(response.filter(cert => cert.is_active));
    } catch (error: any) {
      console.error('Error loading certifications:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Error en el reconocimiento de voz');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast.error('El reconocimiento de voz no está soportado en este navegador');
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleCertificationSelect = (certCode: string | null) => {
    if (onCertificationSelect) {
      onCertificationSelect(certCode);
    }
  };

  const handleQuickAction = (action: string) => {
    let actionMessage = '';
    switch (action) {
      case 'syllabus':
        actionMessage = 'Ver Syllabus de la certificación seleccionada';
        break;
      case 'test':
        actionMessage = 'Generar un test de práctica';
        break;
      case 'concepts':
        actionMessage = 'Explicar conceptos clave de ISTQB';
        break;
      case 'tips':
        actionMessage = 'Dar tips para el examen';
        break;
      case 'faq':
        actionMessage = 'Preguntas frecuentes sobre ISTQB';
        break;
      case 'summary':
        actionMessage = 'Hacer un resumen de los temas importantes';
        break;
    }
    setMessage(actionMessage);
  };

  const selectedCert = certifications.find(cert => cert.code === selectedCertification);

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {/* Context Bar - like in the image */}
      {selectedCertification && selectedCert && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-900">Contexto activo:</span>
                <span className="text-sm font-semibold text-blue-800">{selectedCert.code}</span>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">General</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">Certificación activa para el contexto del chat</p>
            </div>
          </div>
          <button
            onClick={() => handleCertificationSelect(null)}
            className="text-blue-600 hover:text-blue-800 text-lg font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="mb-4">
        {/* Action Buttons Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <Lightbulb className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Acciones Rápidas</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{selectedCert?.code || 'General'}</span>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showQuickActions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        {showQuickActions && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleQuickAction('syllabus')}
              className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3 px-4 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Ver Syllabus</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('test')}
              className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white rounded-lg py-3 px-4 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Generar Test</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('concepts')}
              className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-3 px-4 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm font-medium">Conceptos Clave</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('tips')}
              className="flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 px-4 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Tips de Examen</span>
            </button>
          </div>
        )}

        {/* Secondary Actions */}
        {showQuickActions && (
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => handleQuickAction('faq')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('summary')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <FileX className="w-4 h-4" />
              <span>Resumen</span>
            </button>
          </div>
        )}

        {/* Toggle Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
          >
            {showQuickActions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{showQuickActions ? 'Ocultar acciones rápidas' : 'Mostrar acciones rápidas'}</span>
          </button>
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32 text-sm"
            rows={1}
            disabled={isLoading}
          />
        </div>
        
        {/* Voice Button */}
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={cn(
            "p-3 rounded-lg transition-colors",
            isListening 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          disabled={isLoading}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={cn(
            "p-3 rounded-lg transition-colors",
            message.trim() && !isLoading
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
};