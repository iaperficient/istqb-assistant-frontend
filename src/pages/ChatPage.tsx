import React, { useEffect, useRef, useState } from 'react';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { CertificationSelector } from '../components/CertificationSelector';
import { useChat } from '../hooks/useChat';

export const ChatPage: React.FC = () => {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedCertification, setSelectedCertification] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message: string, voiceInput?: boolean) => {
    // Include certification context if one is selected
    const messageWithContext = {
      message,
      certification_code: selectedCertification || undefined
    };
    sendMessage(messageWithContext, voiceInput);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader />
      
      {/* Certification Selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <CertificationSelector
            selectedCertification={selectedCertification}
            onCertificationSelect={setSelectedCertification}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
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
          />
        </div>
      </div>
    </div>
  );
};