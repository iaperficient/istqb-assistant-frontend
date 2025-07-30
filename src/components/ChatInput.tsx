import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { cn } from '../utils/cn';

interface ChatInputProps {
  onSendMessage: (message: string, context?: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Pregunta sobre certificaciones ISTQB..." 
}) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

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
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
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
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const suggestions = [
    "¿Qué es ISTQB?",
    "Explícame los niveles de certificación",
    "¿Cuáles son las técnicas de testing?",
    "Diferencias entre testing manual y automatizado"
  ];

  return (
    <div className="bg-white border-t border-gray-200">
      {/* Main Input Area */}
      <div className="p-4">
        {/* Suggestions when no message */}
        {message === '' && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Sugerencias:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(suggestion)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Message Input Form */}
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              rows={1}
              className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 max-h-32 shadow-sm"
              disabled={isLoading}
            />
            
            {/* Voice Input Button */}
            {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
              <button
                type="button"
                onClick={startListening}
                disabled={isLoading || isListening}
                className={cn(
                  'absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors duration-200',
                  isListening 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                )}
                title={isListening ? 'Escuchando...' : 'Usar micrófono'}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className={cn(
              'p-3 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[48px]',
              message.trim() && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
            title={message.trim() ? 'Enviar mensaje' : 'Escribe un mensaje'}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}