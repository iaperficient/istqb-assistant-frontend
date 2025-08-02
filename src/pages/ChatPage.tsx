

import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../services/api';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { CertificationSelector } from '../components/CertificationSelector';
import { useChat } from '../hooks/useChat';
import { ConversationSidebar } from '../components/ConversationSidebar';

export const ChatPage: React.FC = () => {
  const { messagesMap, getMessagesForConversation, setMessagesForConversation, isLoading, sendMessage, clearChat, conversationId, setConversationId } = useChat();
  const [messagesState, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedCertification, setSelectedCertification] = useState<string | null>(null);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [conversations, setConversations] = useState<{ id: string; label: string; startDate: string }[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId);
  const [message, setMessage] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesState]);

  useEffect(() => {
    // Load initial conversation list from localStorage or empty
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  useEffect(() => {
    // Save conversations list to localStorage
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    setMessages(getMessagesForConversation(activeConversationId || conversationId));
  }, [activeConversationId, conversationId, messagesMap]);

  const handleSendMessage = (message: string, voiceInput?: boolean) => {
    const messageWithContext = {
      message,
      certification_code: selectedCertification || undefined,
      conversation_id: activeConversationId || conversationId,
    };
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    sendMessage(messageWithContext, voiceInput);
  };

  const handleNewChat = () => {
    const newId = uuidv4();
    setActiveConversationId(newId);
    setConversationId(newId);
    const defaultSystemMessage = {
      id: Date.now().toString(),
      content: 'Hello! How can I assist you with ISTQB certifications today?',
      isUser: false,
      timestamp: new Date(),
    };
    setMessagesForConversation(newId, [defaultSystemMessage]);
    setMessages([defaultSystemMessage]);
    setHasUserSentMessage(false);
    setConversations(prev => [
      { id: newId, label: `Chat ${prev.length + 1}`, startDate: new Date().toLocaleDateString() },
      ...prev,
    ]);
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    setConversationId(id);
    setHasUserSentMessage(true);
    // Fetch conversation history from backend
    try {
      const history = await apiService.getChatHistory(id);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load conversation history', error);
    }
  };

  const handleFeedback = (feedback: 'up' | 'down', messageId: string) => {
    console.log(`Feedback for message ${messageId}: ${feedback}`);
  };

  return (
    <div className="flex h-screen bg-white">
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={(id) => {
          setConversations((prev) => prev.filter((conv) => conv.id !== id));
          if (activeConversationId === id) {
            clearChat();
            setMessages([]);
            setActiveConversationId(null);
            setHasUserSentMessage(false);
          }
        }}
      />
      <div className="flex flex-col flex-1">
        <ChatHeader />
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto">
            {messagesState.map((message) => (
              <ChatMessage key={message.id} message={message} handleFeedback={handleFeedback} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="bg-white">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              selectedCertification={selectedCertification}
              onCertificationSelect={setSelectedCertification}
              onClearChat={clearChat}
              showQuickActions={!hasUserSentMessage}
              message={message}
              setMessage={setMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
