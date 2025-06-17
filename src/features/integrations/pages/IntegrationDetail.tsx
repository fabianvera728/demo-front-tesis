import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { integrationService } from '@/services/integrationService';
import { DataIntegration, Job } from '@/types/integration';
import Button from '@/components/ui/Button';
import FeatherIcon from 'feather-icons-react';

const IntegrationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [integration, setIntegration] = useState<DataIntegration | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadIntegrationData(id);
    }
  }, [id]);

  const loadIntegrationData = async (integrationId: string) => {
    try {
      setIsLoading(true);
      const [integrationData, jobsData] = await Promise.all([
        integrationService.getIntegrationById(integrationId),
        integrationService.getJobsByIntegration(integrationId)
      ]);
      
      setIntegration(integrationData);
      setJobs(jobsData);
    } catch (err) {
      setError('Error al cargar los datos de la integración');
      console.error('Error loading integration data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunIntegration = async () => {
    if (!integration) return;
    
    try {
      await integrationService.runIntegration(integration.id);
      alert('Integración ejecutada exitosamente');
      // Recargar datos para ver el nuevo job
      loadIntegrationData(integration.id);
    } catch (err) {
      alert('Error al ejecutar la integración');
      console.error('Error running integration:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'api':
        return 'globe';
      case 'web':
        return 'monitor';
      case 'file':
        return 'file';
      default:
        return 'help-circle';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !integration) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error || 'Integración no encontrada'}</p>
        <Button onClick={() => navigate('/integrations')} className="mt-2">
          Volver a Integraciones
        </Button>
      </div>
    );
  }

  const recentJobs = jobs
    .sort((a, b) => new Date(b.startedAt || '').getTime() - new Date(a.startedAt || '').getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Button 
              onClick={() => navigate('/integrations')} 
              variant="outline"
              size="sm"
            >
              Volver
            </Button>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(integration.status)}`}>
              {integration.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{integration.name}</h1>
          <p className="text-gray-600">{integration.description}</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleRunIntegration}
            disabled={integration.status === 'inactive'}
          >
            Ejecutar Ahora
          </Button>
          <Button 
            onClick={() => navigate(`/integrations/${integration.id}/edit`)}
            variant="outline"
          >
            Editar
          </Button>
        </div>
      </div>

      {/* Configuration Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Dataset de Destino</label>
              <p className="text-gray-900">
                <Link 
                  to={`/datasets/${integration.datasetId}`}
                  className="hover:text-blue-600 hover:underline"
                >
                  {integration.datasetName}
                </Link>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Creado</label>
              <p className="text-gray-900">{new Date(integration.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Última Actualización</label>
              <p className="text-gray-900">{new Date(integration.updatedAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Última Ejecución</label>
              <p className="text-gray-900">
                {integration.lastRun ? new Date(integration.lastRun).toLocaleString() : 'Nunca'}
              </p>
            </div>
            {integration.nextRun && (
              <div>
                <label className="text-sm font-medium text-gray-600">Próxima Ejecución</label>
                <p className="text-gray-900">{new Date(integration.nextRun).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Source Configuration */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FeatherIcon 
              icon={getSourceIcon(integration.harvestConfig.source_type)} 
              size={20} 
              className="mr-2 text-gray-600" 
            />
            Configuración de Fuente
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Tipo de Fuente</label>
              <p className="text-gray-900 capitalize">{integration.harvestConfig.source_type}</p>
            </div>
            
            {integration.harvestConfig.source_type === 'api' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-600">URL</label>
                  <p className="text-gray-900 break-all">{integration.harvestConfig.config.url}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Método</label>
                  <p className="text-gray-900">{integration.harvestConfig.config.method || 'GET'}</p>
                </div>
              </>
            )}

            {integration.harvestConfig.source_type === 'web' && (
              <div>
                <label className="text-sm font-medium text-gray-600">URL</label>
                <p className="text-gray-900 break-all">{integration.harvestConfig.config.url}</p>
              </div>
            )}

            {integration.harvestConfig.source_type === 'file' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-600">Archivo</label>
                  <p className="text-gray-900">{integration.harvestConfig.config.fileName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo</label>
                  <p className="text-gray-900">{integration.harvestConfig.config.fileType}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Processing Configuration */}
      {integration.processingConfig && integration.processingConfig.operations.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FeatherIcon icon="settings" size={20} className="mr-2 text-gray-600" />
            Operaciones de Procesamiento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integration.processingConfig.operations.map((operation, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{operation.name}</h4>
                <p className="text-sm text-gray-600">{operation.description}</p>
                {Object.keys(operation.parameters).length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600">Parámetros:</p>
                    <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded mt-1">
                      {JSON.stringify(operation.parameters, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Configuration */}
      {integration.schedule && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FeatherIcon icon="clock" size={20} className="mr-2 text-gray-600" />
            Configuración de Programación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Tipo</label>
              <p className="text-gray-900 capitalize">{integration.schedule.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <p className="text-gray-900">{integration.schedule.enabled ? 'Habilitado' : 'Deshabilitado'}</p>
            </div>
            {integration.schedule.interval && (
              <div>
                <label className="text-sm font-medium text-gray-600">Intervalo</label>
                <p className="text-gray-900">{integration.schedule.interval} minutos</p>
              </div>
            )}
            {integration.schedule.cron && (
              <div>
                <label className="text-sm font-medium text-gray-600">Cron Expression</label>
                <p className="text-gray-900 font-mono">{integration.schedule.cron}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Jobs Recientes</h3>
            <Link
              to="/integrations/jobs"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos los jobs
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <FeatherIcon icon="clock" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No hay jobs ejecutados para esta integración</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Job ID</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Iniciado</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Duración</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-900">#{job.id.slice(-8)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {job.startedAt ? new Date(job.startedAt).toLocaleString() : 'No iniciado'}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {job.startedAt && job.completedAt ? 
                          Math.floor((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000) + 's' : 
                          job.startedAt ? 
                            Math.floor((new Date().getTime() - new Date(job.startedAt).getTime()) / 1000) + 's' : 
                            'N/A'
                        }
                      </td>
                      <td className="py-3 text-sm">
                        {job.result ? (
                          <span className="text-green-600">
                            {job.result.harvestedItems} elementos
                          </span>
                        ) : job.error ? (
                          <span className="text-red-600 truncate max-w-xs" title={job.error}>
                            Error
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationDetail; 