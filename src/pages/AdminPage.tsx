import React, { useState } from 'react';
import { Users, Settings, BarChart3, FileText, ArrowLeft, Home, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserManagement } from '../components/UserManagement';
import { SystemStats } from '../components/SystemStats';
import { DashboardOverview } from '../components/DashboardOverview';
import { CertificationManagement } from '../components/CertificationManagement';

type AdminTab = 'dashboard' | 'users' | 'certifications' | 'settings';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Panel General', icon: Home },
    { id: 'users' as AdminTab, label: 'Usuarios', icon: Users },
    { id: 'certifications' as AdminTab, label: 'Certificaciones', icon: Award },
    { id: 'settings' as AdminTab, label: 'Configuración', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'certifications':
        return <CertificationManagement />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Sistema</h3>
            <p className="text-gray-600">Configuraciones del sistema próximamente...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Volver al Chat"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">Gestiona usuarios y configuraciones del sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};