import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Database, BarChart3, Settings, Users, MessageCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import UserManagement from './UserManagement';
import CertificationList from './CertificationList';

interface AdminPanelProps {
  onAddCertification: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onAddCertification }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'certifications' | 'users' | 'system'>('overview');

  const tabs = [
    { id: 'overview', label: 'Panel General', icon: BarChart3 },
    { id: 'certifications', label: 'Certificaciones', icon: Database },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'system', label: 'Sistema', icon: Settings },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-500">Bienvenido, {user?.username}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Ir al Chat
            </button>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Administrador
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'certifications' && <CertificationsTab onAddCertification={onAddCertification} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'system' && <SystemTab />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState({
    certifications: { total: 0, active: 0, inactive: 0, loading: true },
    users: { total: 0, active: 0, loading: true },
    rag: { status: 'unknown', documents: 0, loading: true },
    system: { status: 'checking', loading: true }
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      // Load certifications stats
      const certifications = await apiService.getCertifications();
      const activeCerts = certifications.filter(cert => cert.is_active).length;
      const inactiveCerts = certifications.length - activeCerts;

      setStats(prev => ({
        ...prev,
        certifications: {
          total: certifications.length,
          active: activeCerts,
          inactive: inactiveCerts,
          loading: false
        }
      }));

      // Load users stats
      try {
        const userStats = await apiService.getUserStats();
        setStats(prev => ({
          ...prev,
          users: {
            total: userStats.total_users,
            active: userStats.active_users,
            loading: false
          }
        }));
      } catch (error) {
        // Fallback if getUserStats is not available
        const users = await apiService.getAllUsers();
        setStats(prev => ({
          ...prev,
          users: {
            total: users.total,
            active: users.users.filter(u => u.is_active).length,
            loading: false
          }
        }));
      }

      // Load RAG status
      try {
        const ragStatus = await apiService.getRagStatus();
        setStats(prev => ({
          ...prev,
          rag: {
            status: ragStatus.status || 'active',
            documents: ragStatus.total_documents || 0,
            loading: false
          }
        }));
      } catch (error) {
        setStats(prev => ({
          ...prev,
          rag: {
            status: 'inactive',
            documents: 0,
            loading: false
          }
        }));
      }

      // Load system health
      try {
        await apiService.healthCheck();
        setStats(prev => ({
          ...prev,
          system: {
            status: 'active',
            loading: false
          }
        }));
      } catch (error) {
        setStats(prev => ({
          ...prev,
          system: {
            status: 'error',
            loading: false
          }
        }));
      }

      // Generate recent activity from certifications
      const recentCerts = certifications
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(cert => ({
          id: cert.id,
          type: 'certification',
          title: `Certificación "${cert.name}" creada`,
          subtitle: cert.code,
          timestamp: cert.created_at,
          status: cert.is_active ? 'success' : 'warning'
        }));

      setRecentActivity(recentCerts);

    } catch (error) {
      console.error('Error loading overview data:', error);
      toast.error('Error al cargar datos del panel general');
    } finally {
      setActivityLoading(false);
    }
  };

  const getRagStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-red-600';
      case 'processing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRagStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'processing': return 'Procesando';
      default: return 'Desconocido';
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSystemStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'error': return 'Error';
      case 'checking': return 'Verificando...';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Certifications Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Certificaciones</p>
              {stats.certifications.loading ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Cargando...</span>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-gray-900">{stats.certifications.total}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span className="text-green-600">{stats.certifications.active} activas</span>
                    <span>•</span>
                    <span className="text-red-600">{stats.certifications.inactive} inactivas</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Users Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Usuarios</p>
              {stats.users.loading ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Cargando...</span>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-gray-900">{stats.users.total}</p>
                  <p className="text-xs text-green-600 mt-1">{stats.users.active} activos</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RAG Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Sistema RAG</p>
              {stats.rag.loading ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Cargando...</span>
                </div>
              ) : (
                <>
                  <p className={`text-2xl font-semibold ${getRagStatusColor(stats.rag.status)}`}>
                    {getRagStatusText(stats.rag.status)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.rag.documents} documentos</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Sistema</p>
              {stats.system.loading ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Verificando...</span>
                </div>
              ) : (
                <p className={`text-2xl font-semibold ${getSystemStatusColor(stats.system.status)}`}>
                  {getSystemStatusText(stats.system.status)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
            <button
              onClick={loadOverviewData}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-3" />
                <span className="text-gray-500">Cargando actividad reciente...</span>
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay actividad reciente para mostrar</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' : 
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      {activity.subtitle && (
                        <p className="text-xs text-gray-500">{activity.subtitle}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Certifications Tab Component
const CertificationsTab: React.FC<{ onAddCertification: () => void }> = ({ onAddCertification }) => {
  const handleCreateCertification = () => {
    // Esta función será manejada por el CertificationList component internamente
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Certificaciones</h2>
      </div>

      <CertificationList onCreateCertification={handleCreateCertification} />
    </div>
  );
};

// Users Tab Component
const UsersTab: React.FC = () => {
  const handleCreateUser = () => {
    // Esta función será manejada por el UserManagement component internamente
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
      </div>

      <UserManagement onCreateUser={handleCreateUser} />
    </div>
  );
};

// System Tab Component
const SystemTab: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Estado del Sistema RAG</h3>
            <p className="text-sm text-gray-500 mt-1">
              Información sobre el sistema de recuperación de información
            </p>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">Información del sistema RAG próximamente</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Configuración General</h3>
            <p className="text-sm text-gray-500 mt-1">
              Configuraciones globales del sistema
            </p>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">Configuraciones próximamente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;