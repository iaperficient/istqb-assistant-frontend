import React from 'react';

interface Conversation {
  id: string;
  label: string;
  startDate: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}) => {
  return (
    <div className="w-64 border-r border-gray-300 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <p className="p-4 text-gray-500">No conversations yet</p>
        )}
        <ul>
          {conversations.map((conv) => (
            <li
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                conv.id === activeConversationId ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div>{conv.label}</div>
                  <div className="text-xs text-gray-500">{conv.startDate}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Call delete handler passed via props
                    if (onDeleteConversation) {
                      onDeleteConversation(conv.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Delete conversation"
                  type="button"
                >
                  &times;
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 border-t border-gray-300">
        <button
          onClick={() => onNewChat()}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + New Chat
        </button>
      </div>
    </div>
  );
};
