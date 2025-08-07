
import React, { useState, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../types/chat';
import { cn } from '../utils/cn';

interface ChatMessageProps {
  message: Message;
  isInitialAssistantMessage?: boolean;
  handleFeedback: (feedback: 'up' | 'down', messageId: string) => void; // Added feedback handler
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isInitialAssistantMessage, handleFeedback }) => {
  const { content, isUser, isLoading } = message;
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const onFeedbackClick = (feedback: 'up' | 'down') => {
    setFeedbackGiven(feedback);
    setShowTooltip(true);
    handleFeedback(feedback, message.id);
  };

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  return (
    <div
      className={cn(
        'flex flex-col p-4 animate-slide-up',
        isUser ? 'items-end' : 'items-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mb-2">
          <Bot className="h-5 w-5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl rounded-2xl p-4',
          isUser ? 'bg-gray-200 text-gray-900 rounded-br-md' : ''
        )}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-500">The assistant is typing...</span>
          </div>
        ) : (
          <p className={cn('text-sm sm:text-base whitespace-pre-wrap', 'text-gray-900')}>
            {content}
          </p>
        )}
      </div>

      {!isUser && !isLoading && !isInitialAssistantMessage && (
        <>
          <div className="flex space-x-2 mt-2 justify-center">
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={() => onFeedbackClick('up')}
              aria-label="Thumbs up"
            >
              👍
            </button>
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={() => onFeedbackClick('down')}
              aria-label="Thumbs down"
            >
              👎
            </button>
          </div>
          {showTooltip && (
            <div className="text-center text-gray-700 text-xs mt-1 animate-fade-out">
              {feedbackGiven === 'up' ? 'Good response' : 'Bad response'}
            </div>
          )}
        </>
      )}

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
};
