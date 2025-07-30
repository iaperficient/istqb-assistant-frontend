import { useState, useCallback } from 'react';
import { Message } from '../types/chat';
import { ChatMessage } from '../types/api';
import apiService from '../services/api';
import { toast } from 'react-toastify';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente especializado en certificaciones ISTQB. Estoy aquí para ayudarte con cualquier pregunta sobre testing de software, certificaciones, técnicas de pruebas y mucho más. ¿En qué puedo asistirte hoy?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (messageData: ChatMessage | string, voiceInput?: boolean) => {
    // Handle both string and ChatMessage object formats
    const content = typeof messageData === 'string' ? messageData : messageData.message;
    const chatPayload: ChatMessage = typeof messageData === 'string' 
      ? { message: messageData }
      : messageData;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await apiService.chat(chatPayload);
      
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => prev.slice(0, -1).concat(assistantMessage));
    } catch (error: any) {
      setMessages(prev => prev.slice(0, -1));
      
      if (error.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else {
        toast.error(error.message || 'Error al enviar mensaje. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: '¡Hola! Soy tu asistente especializado en certificaciones ISTQB. Estoy aquí para ayudarte con cualquier pregunta sobre testing de software, certificaciones, técnicas de pruebas y mucho más. ¿En qué puedo asistirte hoy?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};