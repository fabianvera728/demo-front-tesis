import React, { useState, useEffect } from 'react';
import { integrationService } from '@/services/integrationService';
import { Job } from '@/types/integration';
import Button from '@/components/ui/Button';
import FeatherIcon from 'feather-icons-react';

const JobMonitor: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'status'>('newest');

  useEffect(() => {
    loadJobs();
    // Actualizar cada 5 segundos para jobs en tiempo real
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadJobs = async () => {
    try {
      const jobsData = await integrationService.getAllJobs();
      setJobs(jobsData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los jobs');
      console.error('Error loading jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobs = jobs
    .filter(job => {
      switch (filter) {
        case 'running':
          return job.status === 'running' || job.status === 'pending';
        case 'completed':
          return job.status === 'completed';
        case 'failed':
          return job.status === 'failed';
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.startedAt || '').getTime() - new Date(b.startedAt || '').getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return new Date(b.startedAt || '').getTime() - new Date(a.startedAt || '').getTime();
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'running':
        return 'clock';
      case 'pending':
        return 'pause-circle';
      case 'failed':
        return 'alert-circle';
      default:
        return 'circle';
    }
  };

  const formatDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return 'N/A';
    
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  const stats = {
    total: jobs.length,
    running: jobs.filter(j => j.status === 'running').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length
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
          <h1 className="text-2xl font-bold text-gray-900">Monitor de Jobs</h1>
          <p className="text-gray-600">Monitorea el estado de todos los trabajos en tiempo real</p>
        </div>
        <Button onClick={loadJobs} variant="outline">
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

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <FeatherIcon icon="activity" size={20} className="text-gray-600 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Total</p>
              <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <FeatherIcon icon="clock" size={20} className="text-blue-600 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">En Ejecución</p>
              <p className="text-xl font-semibold text-blue-600">{stats.running}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <FeatherIcon icon="pause-circle" size={20} className="text-yellow-600 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Pendientes</p>
              <p className="text-xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <FeatherIcon icon="check-circle" size={20} className="text-green-600 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Completados</p>
              <p className="text-xl font-semibold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <FeatherIcon icon="alert-circle" size={20} className="text-red-600 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Fallidos</p>
              <p className="text-xl font-semibold text-red-600">{stats.failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtro</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="running">En Ejecución</option>
                <option value="completed">Completados</option>
                <option value="failed">Fallidos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Más Recientes</option>
                <option value="oldest">Más Antiguos</option>
                <option value="status">Estado</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Mostrando {filteredJobs.length} de {jobs.length} jobs
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <FeatherIcon icon="clock" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay jobs</h3>
            <p className="text-gray-600">No se encontraron jobs con los filtros aplicados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Integración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Iniciado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{job.id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Integration #{job.integrationId.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FeatherIcon 
                          icon={getStatusIcon(job.status)} 
                          size={16} 
                          className="mr-2 text-gray-400" 
                        />
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.status === 'running' ? (
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{job.progress}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(job.startedAt, job.completedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.startedAt ? new Date(job.startedAt).toLocaleString() : 'No iniciado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.result ? (
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {job.result.harvestedItems} cosechados
                          </div>
                          <div className="text-gray-500">
                            {job.result.processedItems} procesados
                          </div>
                        </div>
                      ) : job.error ? (
                        <div className="text-sm text-red-600 truncate max-w-xs" title={job.error}>
                          {job.error}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          Actualizando en tiempo real cada 5 segundos
        </div>
      </div>
    </div>
  );
};

export default JobMonitor; 