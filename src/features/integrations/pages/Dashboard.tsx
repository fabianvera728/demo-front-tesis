import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { integrationService } from '@/services/integrationService';
import { DataIntegration, Job } from '@/types/integration';
import Button from '@/components/ui/Button';
import FeatherIcon from 'feather-icons-react';

const Dashboard: React.FC = () => {
  const [integrations, setIntegrations] = useState<DataIntegration[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    // Configurar actualización automática cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [integrationsData, jobsData] = await Promise.all([
        integrationService.getAllIntegrations(),
        integrationService.getAllJobs()
      ]);
      
      setIntegrations(integrationsData);
      setJobs(jobsData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estadísticas
  const stats = {
    totalIntegrations: integrations.length,
    activeIntegrations: integrations.filter(i => i.status === 'active').length,
    totalJobs: jobs.length,
    runningJobs: jobs.filter(j => j.status === 'running').length,
    completedJobs: jobs.filter(j => j.status === 'completed').length,
    failedJobs: jobs.filter(j => j.status === 'failed').length,
    successRate: jobs.length > 0 ? Math.round((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100) : 0
  };

  const recentJobs = jobs
    .sort((a, b) => new Date(b.startedAt || '').getTime() - new Date(a.startedAt || '').getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'running':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'check-circle';
      case 'running':
        return 'clock';
      case 'pending':
        return 'pause-circle';
      case 'failed':
      case 'error':
        return 'alert-circle';
      default:
        return 'circle';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Integraciones</h1>
          <p className="text-gray-600">Monitorea el estado de tus integraciones y trabajos</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <FeatherIcon icon="alert-circle" size={16} className="text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FeatherIcon icon="link" size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Integraciones</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalIntegrations}</p>
                <p className="ml-2 text-sm text-green-600">{stats.activeIntegrations} activas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FeatherIcon icon="activity" size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jobs Ejecutados</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalJobs}</p>
                <p className="ml-2 text-sm text-yellow-600">{stats.runningJobs} en ejecución</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FeatherIcon icon="check-circle" size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Exitosos</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stats.completedJobs}</p>
                <p className="ml-2 text-sm text-gray-600">jobs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <FeatherIcon icon="alert-circle" size={24} className="text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fallidos</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stats.failedJobs}</p>
                <p className="ml-2 text-sm text-gray-600">jobs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Rate Card */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Tasa de Éxito</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.successRate}%</p>
            <p className="text-sm text-gray-600">
              {stats.completedJobs} de {stats.totalJobs} jobs ejecutados exitosamente
            </p>
          </div>
          <div className="w-32 h-32">
            <div className="relative w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${stats.successRate * 2.51} 251`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{stats.successRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Jobs Recientes</h3>
              <Link
                to="/integrations/jobs"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todos
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <FeatherIcon icon="clock" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No hay jobs recientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${getStatusColor(job.status)}`}>
                        <FeatherIcon icon={getStatusIcon(job.status)} size={16} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          Job #{job.id.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {job.startedAt ? new Date(job.startedAt).toLocaleString() : 'Sin iniciar'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      {job.status === 'running' && (
                        <div className="mt-1">
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Integrations */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Integraciones Activas</h3>
              <Link
                to="/integrations"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas
              </Link>
            </div>
          </div>
          <div className="p-6">
            {integrations.filter(i => i.status === 'active').length === 0 ? (
              <div className="text-center py-8">
                <FeatherIcon icon="link" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No hay integraciones activas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {integrations
                  .filter(i => i.status === 'active')
                  .slice(0, 5)
                  .map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-full">
                          <FeatherIcon 
                            icon={integration.harvestConfig.source_type === 'api' ? 'globe' : 
                                  integration.harvestConfig.source_type === 'web' ? 'monitor' : 'file'}
                            size={16} 
                            className="text-green-600"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            <Link 
                              to={`/integrations/${integration.id}`}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {integration.name}
                            </Link>
                          </p>
                          <p className="text-xs text-gray-600">
                            {integration.datasetName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">
                          Última ejecución:
                        </p>
                        <p className="text-xs text-gray-900">
                          {integration.lastRun ? new Date(integration.lastRun).toLocaleDateString() : 'Nunca'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/integrations/create"
            className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div>
              <p className="font-medium text-blue-700">Nueva Integración</p>
              <p className="text-sm text-blue-600">Conectar una nueva fuente de datos</p>
            </div>
          </Link>
          
          <Link
            to="/integrations/jobs"
            className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div>
              <p className="font-medium text-green-700">Monitorear Jobs</p>
              <p className="text-sm text-green-600">Ver estado de trabajos en tiempo real</p>
            </div>
          </Link>
          
          <Link
            to="/datasets"
            className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-700">Ver Datasets</p>
              <p className="text-sm text-gray-600">Explorar datos recolectados</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 