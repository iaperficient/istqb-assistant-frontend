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
  showQuickActions?: boolean;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Ask about ISTQB certifications...",
  selectedCertification,
  onCertificationSelect,
  onClearChat,
  showQuickActions = true,
  message,
  setMessage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [certifications, setCertifications] = useState<CertificationResponse[]>([]);
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
      // Clear the message only after successful processing
      setTimeout(() => setMessage(''), 500); // Delay clearing the input
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
      recognition.lang = 'en-US';

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
        toast.error('Error in voice recognition');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast.error('Voice recognition is not supported in this browser');
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
        actionMessage = 'View syllabus for the selected certification';
        break;
      case 'test':
        actionMessage = 'Generate a practice test';
        break;
      case 'concepts':
        actionMessage = 'Explain key concepts of ISTQB';
        break;
      case 'tips':
        actionMessage = 'Provide exam tips';
        break;
      case 'faq':
        actionMessage = 'Frequently asked questions about ISTQB';
        break;
      case 'summary':
        actionMessage = 'Summarize important topics';
        break;
    }
    setMessage(actionMessage);
  };

  const selectedCert = certifications.find(cert => cert.code === selectedCertification);

  return (
    <div className="p-4 bg-white">
      {/* Context Bar - like in the image */}
      {selectedCertification && selectedCert && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-900">Active context:</span>
                <span className="text-sm font-semibold text-blue-800">{selectedCert.code}</span>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">General</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">Active certification for the chat context</p>
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

      {/* Default Suggestions */}
      {showQuickActions && (
        <div className="mb-3 flex space-x-2 justify-center">
          <button
            type="button"
            onClick={() => setMessage("How can I prepare for an ISTQB exam?")}
            className="bg-pink-100 text-pink-800 hover:opacity-80 px-3 py-1 rounded-full text-sm"
          >
            How can I prepare for an ISTQB exam?
          </button>
          <button
            type="button"
            onClick={() => setMessage("What certifications does ISTQB offer?")}
            className="bg-green-100 text-green-800 hover:opacity-80 px-3 py-1 rounded-full text-sm"
          >
            What certifications does ISTQB offer?
          </button>
          <button
            type="button"
            onClick={() => setMessage("What is the ISTQB Foundation Level?")}
            className="bg-blue-100 text-blue-800 hover:opacity-80 px-3 py-1 rounded-full text-sm"
          >
            What is the ISTQB Foundation Level?
          </button>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="relative flex items-end w-[896px]">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="w-full pr-12 py-4 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none max-h-40 text-lg pl-4 text-gray-500"
          style={{
            scrollbarWidth: 'none',
            /* @ts-ignore */
            msOverflowStyle: 'none',
          }}
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            target.style.scrollbarWidth = 'none';
            /* @ts-ignore */
            target.style.msOverflowStyle = 'none';
          }}
        />
        <style>
          {`
            textarea::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        {message.trim() && !isLoading && (
          <button
            type="submit"
            className="absolute right-3 bottom-4 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        )}
      </form>
    </div>
  );
};
