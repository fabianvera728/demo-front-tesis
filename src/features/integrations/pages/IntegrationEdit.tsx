import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import FeatherIcon from 'feather-icons-react';

const IntegrationEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Integración</h1>
          <p className="text-gray-600">Modifica la configuración de tu integración de datos</p>
        </div>
        <Button onClick={() => navigate(`/integrations/${id}`)} variant="outline">
          Volver
        </Button>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-12">
          <FeatherIcon icon="edit" size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Funcionalidad en Desarrollo</h3>
          <p className="text-gray-600 mb-6">
            La edición de integraciones estará disponible próximamente
          </p>
          <Button onClick={() => navigate(`/integrations/${id}`)}>
            Volver a los Detalles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationEdit; 