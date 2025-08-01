import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types/chat';
import { ChatMessage } from '../types/api';
import apiService from '../services/api';
import { toast } from 'react-toastify';

export const useChat = () => {
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('messages_map');
    return saved ? JSON.parse(saved) : {};
  });
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>(() => {
    const savedId = localStorage.getItem('conversation_id');
    return savedId || uuidv4();
  });

  useEffect(() => {
    localStorage.setItem('conversation_id', conversationId);
  }, [conversationId]);

  useEffect(() => {
    localStorage.setItem('messages_map', JSON.stringify(messagesMap));
  }, [messagesMap]);

  const getMessagesForConversation = (id: string): Message[] => {
    return messagesMap[id] || [];
  };

  const setMessagesForConversation = (id: string, messages: Message[]) => {
    setMessagesMap(prev => ({ ...prev, [id]: messages }));
  };

  const sendMessage = useCallback(async (messageData: ChatMessage | string, voiceInput?: boolean) => {
    const content = typeof messageData === 'string' ? messageData : messageData.message;
    const chatPayload: ChatMessage = typeof messageData === 'string' 
      ? { message: messageData }
      : messageData;

    chatPayload.conversation_id = conversationId;

    const token = localStorage.getItem('token');

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

    const currentMessages = getMessagesForConversation(conversationId);
    setMessagesForConversation(conversationId, [...currentMessages, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await apiService.chat(chatPayload);
      
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      const updatedMessages = getMessagesForConversation(conversationId);
      // Remove loading message before adding assistant's response
      const filteredMessages = updatedMessages.filter(m => !m.isLoading);
      setMessagesForConversation(conversationId, [...filteredMessages, assistantMessage]);
    } catch (error: any) {
      const updatedMessages = getMessagesForConversation(conversationId).slice(0, -1);
      setMessagesForConversation(conversationId, updatedMessages);
      
      if (error.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        toast.error(error.message || 'Error sending message. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, messagesMap]);

  const clearChat = useCallback(() => {
    setMessagesMap(prev => {
      const newMap = { ...prev };
      delete newMap[conversationId];
      return newMap;
    });
    setConversationId(uuidv4());
  }, [conversationId]);

  return {
    messagesMap,
    getMessagesForConversation,
    setMessagesForConversation,
    isLoading,
    sendMessage,
    clearChat,
    conversationId,
    setConversationId,
  };
};
