import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../types/chat';
import { cn } from '../utils/cn';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { content, isUser, timestamp, isLoading } = message;

  return (
    <div
      className={cn(
        'flex gap-3 p-4 animate-slide-up',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
      )}
      
      <div
        className={cn(
          'max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl rounded-2xl p-4 shadow-sm',
          isUser
            ? 'bg-primary-500 text-white rounded-br-md'
            : 'bg-white border border-gray-200 rounded-bl-md'
        )}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-500">El asistente está escribiendo...</span>
          </div>
        ) : (
          <>
            <p className={cn('text-sm sm:text-base whitespace-pre-wrap', isUser ? 'text-white' : 'text-gray-900')}>
              {content}
            </p>
            <p className={cn('text-xs mt-2', isUser ? 'text-primary-100' : 'text-gray-500')}>
              {timestamp.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
};