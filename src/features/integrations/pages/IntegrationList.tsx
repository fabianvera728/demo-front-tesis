import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { integrationService } from '@/services/integrationService';
import { DataIntegration } from '@/types/integration';
import Button from '@/components/ui/Button';
import FeatherIcon from 'feather-icons-react';

const IntegrationList: React.FC = () => {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<DataIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await integrationService.getAllIntegrations();
      setIntegrations(data);
    } catch (err) {
      setError('Error al cargar las integraciones');
      console.error('Error loading integrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunIntegration = async (id: string) => {
    try {
      await integrationService.runIntegration(id);
      // Mostrar notificación de éxito
      alert('Integración ejecutada exitosamente');
      // Actualizar la lista
      loadIntegrations();
    } catch (err) {
      alert('Error al ejecutar la integración');
      console.error('Error running integration:', err);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta integración?')) return;
    
    try {
      await integrationService.deleteIntegration(id);
      setIntegrations(integrations.filter(integration => integration.id !== id));
    } catch (err) {
      alert('Error al eliminar la integración');
      console.error('Error deleting integration:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <Button onClick={loadIntegrations} className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integraciones de Datos</h1>
          <p className="text-gray-600">Gestiona las conexiones entre tus datasets y fuentes de datos</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => navigate('/integrations/dashboard')} variant="outline">
            Dashboard
          </Button>
          <Button onClick={() => navigate('/integrations/jobs')} variant="outline">
            Jobs
          </Button>
          <Button onClick={() => navigate('/integrations/create')}>
            Nueva Integración
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FeatherIcon icon="link" size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Integraciones</p>
              <p className="text-2xl font-semibold text-gray-900">{integrations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FeatherIcon icon="check-circle" size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {integrations.filter(i => i.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FeatherIcon icon="pause-circle" size={20} className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Inactivas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {integrations.filter(i => i.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FeatherIcon icon="alert-circle" size={20} className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Con Errores</p>
              <p className="text-2xl font-semibold text-gray-900">
                {integrations.filter(i => i.status === 'error').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {integrations.length === 0 ? (
          <div className="text-center py-12">
            <FeatherIcon icon="link" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin integraciones</h3>
            <p className="text-gray-600 mb-6">Comienza creando tu primera integración de datos</p>
            <Button onClick={() => navigate('/integrations/create')}>
              Crear Integración
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Integración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dataset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Ejecución
                  </th>
                  <th className="px-6 py-3 right-0 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {integrations.map((integration) => (
                  <tr key={integration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          <Link 
                            to={`/integrations/${integration.id}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {integration.name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">{integration.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{integration.datasetName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FeatherIcon 
                          icon={integration.harvestConfig.source_type === 'api' ? 'globe' : 
                                integration.harvestConfig.source_type === 'web' ? 'monitor' : 'file'}
                          size={16} 
                          className="mr-2 text-gray-400" 
                        />
                        <span className="text-sm text-gray-900 capitalize">
                          {integration.harvestConfig.source_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(integration.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {integration.lastRun ? new Date(integration.lastRun).toLocaleString() : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRunIntegration(integration.id)}
                          disabled={integration.status === 'inactive'}
                        >
                          Ejecutar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/integrations/${integration.id}/edit`)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteIntegration(integration.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationList; 