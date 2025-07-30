import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Activity, 
  Database, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Server
} from 'lucide-react';
import { toast } from 'react-toastify';
import { UserStats } from '../types/api';
import apiService from '../services/api';

interface SystemMetrics {
  totalCertifications: number;
  activeCertifications: number;
  totalDocuments: number;
  ragStatus: 'operational' | 'warning' | 'error';
  ragDocuments: number;
  chatMessages: number;
  systemUptime: string;
}

interface RecentActivity {
  id: number;
  type: 'user_registered' | 'certification_added' | 'document_uploaded' | 'chat_interaction';
  message: string;
  timestamp: string;
  user?: string;
}

export const DashboardOverview: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user stats
      const stats = await apiService.getUserStats();
      setUserStats(stats);

      // Load system metrics (mock data for now)
      const metrics: SystemMetrics = {
        totalCertifications: 12,
        activeCertifications: 10,
        totalDocuments: 45,
        ragStatus: 'operational',
        ragDocuments: 230,
        chatMessages: 1250,
        systemUptime: '15 días'
      };
      setSystemMetrics(metrics);

      // Load recent activity (mock data for now)
      const activity: RecentActivity[] = [
        {
          id: 1,
          type: 'user_registered',
          message: 'Nuevo usuario registrado',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: 'usuario@example.com'
        },
        {
          id: 2,
          type: 'chat_interaction',
          message: 'Consulta sobre ISTQB Foundation Level',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          user: 'estudiante'
        },
        {
          id: 3,
          type: 'certification_added',
          message: 'Nueva certificación agregada: ISTQB Advanced Level',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: 'admin'
        },
        {
          id: 4,
          type: 'document_uploaded',
          message: 'Syllabus actualizado para Foundation Level',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          user: 'admin'
        }
      ];
      setRecentActivity(activity);

    } catch (error: any) {
      toast.error('Error al cargar datos del dashboard');
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'certification_added':
        return <Award className="w-4 h-4 text-green-500" />;
      case 'document_uploaded':
        return <Database className="w-4 h-4 text-purple-500" />;
      case 'chat_interaction':
        return <MessageSquare className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return 'bg-blue-50 border-blue-200';
      case 'certification_added':
        return 'bg-green-50 border-green-200';
      case 'document_uploaded':
        return 'bg-purple-50 border-purple-200';
      case 'chat_interaction':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `hace ${Math.floor(diffInMinutes / 60)} h`;
    } else {
      return `hace ${Math.floor(diffInMinutes / 1440)} días`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics Cards - Horizontal Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900">{userStats?.total_users || 0}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                {userStats?.recent_signups || 0} nuevos este mes
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-3xl font-bold text-gray-900">{userStats?.active_users || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {userStats ? Math.round((userStats.active_users / userStats.total_users) * 100) : 0}% del total
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Certificaciones</p>
              <p className="text-3xl font-bold text-gray-900">{systemMetrics?.totalCertifications || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {systemMetrics?.activeCertifications || 0} activas
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* RAG System */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sistema RAG</p>
              <p className="text-3xl font-bold text-gray-900">{systemMetrics?.ragDocuments || 0}</p>
              <div className="flex items-center mt-1">
                {systemMetrics?.ragStatus === 'operational' ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                )}
                <p className="text-sm text-gray-500">
                  {systemMetrics?.ragStatus === 'operational' ? 'Operativo' : 'Con errores'}
                </p>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Database className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Estado del Sistema</h3>
            <Server className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API</span>
              <span className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                Operativo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de Datos</span>
              <span className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                Conectada
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">RAG System</span>
              <span className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                Disponible
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm text-gray-900">{systemMetrics?.systemUptime}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Actividad de Chat</h3>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mensajes Totales</span>
              <span className="text-sm font-medium text-gray-900">{systemMetrics?.chatMessages}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Promedio Diario</span>
              <span className="text-sm font-medium text-gray-900">~85</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Usuarios Activos Hoy</span>
              <span className="text-sm font-medium text-gray-900">12</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
            <Database className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Documentos</span>
              <span className="text-sm font-medium text-gray-900">{systemMetrics?.totalDocuments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Syllabi</span>
              <span className="text-sm font-medium text-gray-900">28</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Exámenes</span>
              <span className="text-sm font-medium text-gray-900">17</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-500">Por: {activity.user}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay actividad reciente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};