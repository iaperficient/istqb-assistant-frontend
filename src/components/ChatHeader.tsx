import React from 'react';
import { LogOut, Bot, Settings, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ChatHeader: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">ISTQB Assistant</h1>
          <p className="text-sm text-gray-500">Testing Certification Specialist</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block text-right">
          <div className="flex items-center justify-end space-x-2 mb-1">
            <p className="text-sm font-medium text-gray-900">Hello, {user?.username}!</p>
            {isAdmin && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">How can I help you today?</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Admin Panel"
            >
              <Shield className="h-5 w-5" />
            </button>
          )}
          
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};