import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { integrationService } from '@/services/integrationService';
import { datasetService } from '@/services/datasetService';
import { Dataset, DatasetDetail } from '@/types/dataset';
import { 
  DataSource, 
  ProcessingOperation, 
  CreateIntegrationPayload
} from '@/types/integration';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FeatherIcon from 'feather-icons-react';

interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  targetType: 'string' | 'number' | 'boolean' | 'date';
  defaultValue?: string;
}

const IntegrationCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    datasetId: '',
    harvestConfig: {
      source_type: 'api' as 'file' | 'api' | 'web',
      config: {} as any,
      column_mapping: {} as Record<string, string>
    },
    processingConfig: {
      operations: [] as any[]
    }
  });

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [availableOperations, setAvailableOperations] = useState<ProcessingOperation[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DatasetDetail | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [previewResult, setPreviewResult] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // When dataset is selected, load its details including schema
    if (formData.datasetId) {
      loadDatasetDetails(formData.datasetId);
    }
  }, [formData.datasetId]);

  const loadDatasetDetails = async (datasetId: string) => {
    try {
      const datasetDetail = await datasetService.getDatasetById(datasetId);
      setSelectedDataset(datasetDetail);
      
      // Initialize column mappings based on dataset schema
      const mappings: ColumnMapping[] = datasetDetail.columns.map(col => ({
        sourceColumn: '', // To be filled by user
        targetColumn: col.name,
        targetType: col.type as any,
        defaultValue: ''
      }));
      setColumnMappings(mappings);
    } catch (err) {
      console.error('Error loading dataset details:', err);
    }
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Initialize harvest config
      setFormData(prev => ({
        ...prev,
        harvestConfig: {
          source_type: 'api',
          config: { url: '', method: 'GET', headers: {}, root_path: '' },
          column_mapping: {}
        }
      }));

      const [datasetsData, dataSourcesData, operationsData] = await Promise.all([
        datasetService.getAllDatasets(),
        integrationService.getAvailableDataSources(),
        integrationService.getAvailableProcessingOperations()
      ]);
      
      setDatasets(datasetsData);
      setDataSources(dataSourcesData);
      setAvailableOperations(operationsData);
    } catch (err) {
      setError('Error al cargar los datos iniciales');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      harvestConfig: {
        ...prev.harvestConfig,
        config: {
          ...prev.harvestConfig.config,
          [field]: value
        }
      }
    }));
  };

  const handleSourceTypeChange = (sourceType: 'file' | 'api' | 'web') => {
    setFormData(prev => ({
      ...prev,
      harvestConfig: {
        source_type: sourceType,
        config: getDefaultConfigForSourceType(sourceType),
        column_mapping: prev.harvestConfig.column_mapping || {}
      }
    }));
  };

  const getDefaultConfigForSourceType = (sourceType: string) => {
    switch (sourceType) {
      case 'api':
        return { url: '', method: 'GET', headers: {}, root_path: '' };
      case 'file':
        return { file_path: '', file_type: 'csv', delimiter: ',', has_header: true };
      case 'web':
        return { urls: [], selectors: {} };
      default:
        return { url: '', method: 'GET', headers: {}, root_path: '' };
    }
  };

  const getDefaultValuePlaceholder = (type: string) => {
    switch (type) {
      case 'string': return '""';
      case 'number': return '0';
      case 'boolean': return 'false';
      case 'date': return 'null';
      default: return 'null';
    }
  };

  const handleColumnMappingChange = (index: number, field: keyof ColumnMapping, value: any) => {
    const newMappings = [...columnMappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setColumnMappings(newMappings);
    
    // Actualizar el column_mapping en formData
    const columnMappingObj: Record<string, string> = {};
    newMappings.forEach(mapping => {
      if (mapping.sourceColumn && mapping.targetColumn) {
        columnMappingObj[mapping.sourceColumn] = mapping.targetColumn;
      }
    });
    
    setFormData(prev => ({
      ...prev,
      harvestConfig: {
        ...prev.harvestConfig,
        column_mapping: columnMappingObj
      }
    }));
  };

  const addProcessingOperation = (operationId: string) => {
    const operation = availableOperations.find(op => op.id === operationId);
    if (!operation) return;

    const newOperation = {
      id: operationId,
      name: operation.name,
      description: operation.description,
      parameters: {}
    };

    // Set default parameters based on operation type
    if (operationId === 'column-mapping') {
      const columnMappingsObj: Record<string, string> = {};
      const typeConversionsObj: Record<string, string> = {};
      const defaultValuesObj: Record<string, string> = {};

      columnMappings.forEach(mapping => {
        if (mapping.sourceColumn && mapping.targetColumn) {
          columnMappingsObj[mapping.sourceColumn] = mapping.targetColumn;
          typeConversionsObj[mapping.targetColumn] = mapping.targetType;
          if (mapping.defaultValue) {
            defaultValuesObj[mapping.targetColumn] = mapping.defaultValue;
          }
        }
      });

      newOperation.parameters = {
        column_mappings: columnMappingsObj,
        type_conversions: typeConversionsObj,
        default_values: defaultValuesObj
      };
    } else if (operationId === 'data-validation' && selectedDataset) {
      newOperation.parameters = {
        required_columns: selectedDataset.columns.map(col => col.name),
        column_types: selectedDataset.columns.reduce((acc: any, col: any) => {
          acc[col.name] = col.type;
          return acc;
        }, {} as Record<string, string>),
        remove_invalid: false
      };
    }

    setFormData(prev => ({
      ...prev,
      processingConfig: {
        operations: [...prev.processingConfig.operations, newOperation]
      }
    }));
  };

  const removeProcessingOperation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      processingConfig: {
        operations: prev.processingConfig.operations.filter((_, i) => i !== index)
      }
    }));
  };

  const testProcessing = async () => {
    if (!sampleData.length || !formData.processingConfig.operations.length) {
      alert('Necesitas datos de muestra y al menos una operación de procesamiento');
      return;
    }

    try {
      setIsLoading(true);
      const result = await integrationService.testProcessingConfig(
        formData.processingConfig,
        sampleData
      );
      setPreviewResult(result);
    } catch (err) {
      alert('Error al probar el procesamiento');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const testColumnMapping = async () => {
    if (!formData.harvestConfig.config.url) {
      alert('Necesitas configurar la fuente de datos primero');
      return;
    }

    try {
      setIsLoading(true);
      const result = await integrationService.testHarvestConfig(formData.harvestConfig);
      
      if (result.success && result.sample) {
        setSampleData(result.sample);
        alert(`Prueba exitosa! Se obtuvieron ${result.sample.length} registros de muestra.`);
      } else {
        alert(`Error en la prueba: ${result.message}`);
      }
    } catch (err) {
      alert('Error al probar la configuración');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const payload: CreateIntegrationPayload = {
        name: formData.name,
        description: formData.description,
        datasetId: formData.datasetId,
        harvestConfig: formData.harvestConfig,
        processingConfig: formData.processingConfig.operations.length > 0 ? formData.processingConfig : undefined
      };

      await integrationService.createIntegration(payload);
      navigate('/integrations');
    } catch (err) {
      setError('Error al crear la integración');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (isLoading && datasets.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Crear Nueva Integración de Datos
        </h1>
        <p className="text-gray-600">
          Configura el procesamiento y mapeo de datos para tu integración
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              <div className={`text-sm ml-2 ${step <= currentStep ? 'text-blue-600' : 'text-gray-600'}`}>
                {step === 1 && 'Información Básica'}
                {step === 2 && 'Fuente de Datos'}
                {step === 3 && 'Procesamiento'}
                {step === 4 && 'Revisión'}
              </div>
              {step < 4 && (
                <div className={`w-12 h-0.5 mx-4 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h2>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Integración
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
                  placeholder="Ej: Integración API Productos"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dataset Destino
            </label>
            <select
              name="datasetId"
              value={formData.datasetId}
              onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
                  <option value="">Seleccionar dataset...</option>
                  {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                      {dataset.name}
                </option>
              ))}
            </select>
          </div>
        </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe el propósito de esta integración..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Data Source Configuration */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de Fuente de Datos</h2>
          
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Fuente
            </label>
            <div className="grid grid-cols-3 gap-4">
                {['api', 'file', 'web'].map((type) => (
                  <button
                  key={type}
                    type="button"
                    onClick={() => handleSourceTypeChange(type as any)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    formData.harvestConfig.source_type === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  >
                    <FeatherIcon 
                      icon={type === 'api' ? 'server' : type === 'file' ? 'file' : 'globe'}
                      size={24} 
                      className="mx-auto mb-2"
                    />
                    <div className="font-medium capitalize">{type}</div>
                  </button>
              ))}
            </div>
          </div>

            {/* API Configuration */}
          {formData.harvestConfig.source_type === 'api' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de la API</label>
                <Input
                  value={formData.harvestConfig.config.url || ''}
                  onChange={(e) => handleConfigChange('url', e.target.value)}
                  placeholder="https://api.ejemplo.com/datos"
                  required
                />
              </div>
                <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método HTTP</label>
                <select
                  value={formData.harvestConfig.config.method || 'GET'}
                  onChange={(e) => handleConfigChange('method', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ruta Raíz (JSON)</label>
                    <Input
                      value={formData.harvestConfig.config.root_path || ''}
                      onChange={(e) => handleConfigChange('root_path', e.target.value)}
                      placeholder="data.items"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* File Configuration */}
            {formData.harvestConfig.source_type === 'file' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ruta del Archivo</label>
                  <Input
                    value={formData.harvestConfig.config.file_path || ''}
                    onChange={(e) => handleConfigChange('file_path', e.target.value)}
                    placeholder="/ruta/al/archivo.csv"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Archivo</label>
                    <select
                      value={formData.harvestConfig.config.file_type || 'csv'}
                      onChange={(e) => handleConfigChange('file_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delimitador</label>
                    <Input
                      value={formData.harvestConfig.config.delimiter || ','}
                      onChange={(e) => handleConfigChange('delimiter', e.target.value)}
                      placeholder=","
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      checked={formData.harvestConfig.config.has_header || false}
                      onChange={(e) => handleConfigChange('has_header', e.target.checked)}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Tiene encabezados</label>
                  </div>
              </div>
            </div>
          )}

            {/* Web Configuration */}
          {formData.harvestConfig.source_type === 'web' && (
              <div className="space-y-4">
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URLs a Cosechar</label>
                  <textarea
                    value={Array.isArray(formData.harvestConfig.config.urls) ? formData.harvestConfig.config.urls.join('\n') : ''}
                    onChange={(e) => handleConfigChange('urls', e.target.value.split('\n').filter(url => url.trim()))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://ejemplo.com/pagina1&#10;https://ejemplo.com/pagina2"
                required
              />
                </div>
            </div>
          )}
          </div>
        )}

        {/* Step 3: Data Processing & Mapping */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Column Mapping */}
            {selectedDataset && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Mapeo de Columnas</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Define cómo mapear los datos cosechados a las columnas de tu dataset. 
                  Las columnas sin mapeo recibirán valores por defecto según su tipo.
                </p>
                
                {/* Headers */}
                <div className="grid grid-cols-4 gap-4 items-center mb-3 pb-2 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-700">Campo Origen</div>
                  <div className="text-center text-sm font-medium text-gray-700"></div>
                  <div className="text-sm font-medium text-gray-700">Campo Dataset ({selectedDataset.columns.length} columnas)</div>
                  <div className="text-sm font-medium text-gray-700">Valor por Defecto</div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {columnMappings.map((mapping, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Input
                          value={mapping.sourceColumn}
                          onChange={(e) => handleColumnMappingChange(index, 'sourceColumn', e.target.value)}
                          placeholder="ej: product_name"
                          className="text-sm"
                        />
                      </div>
                      <div className="text-center">
                        <FeatherIcon icon="arrow-right" size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={mapping.targetColumn}
                            onChange={(e) => handleColumnMappingChange(index, 'targetColumn', e.target.value)}
                            placeholder="campo_destino"
                            readOnly
                            className="text-sm bg-gray-100"
                          />
                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded">
                            {mapping.targetType}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Input
                          value={mapping.defaultValue || ''}
                          onChange={(e) => handleColumnMappingChange(index, 'defaultValue', e.target.value)}
                          placeholder={`Por defecto: ${getDefaultValuePlaceholder(mapping.targetType)}`}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Mapping Summary */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-blue-800">
                      <FeatherIcon icon="info" size={16} className="mr-2" />
                      <span>
                        {columnMappings.filter(m => m.sourceColumn).length} de {columnMappings.length} columnas mapeadas
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={testColumnMapping}
                      disabled={isLoading || !formData.harvestConfig.config.url}
                      className="text-xs"
                    >
                      <FeatherIcon icon="play" size={14} className="mr-1" />
                      Probar Mapeo
                    </Button>
                  </div>
                
                {/* Sample Data Preview */}
                {sampleData.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Vista Previa de Datos Cosechados</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            {Object.keys(sampleData[0] || {}).map(key => (
                              <th key={key} className="px-2 py-1 text-left font-medium text-gray-700">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sampleData.slice(0, 3).map((row, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              {Object.values(row).map((value: any, cellIndex) => (
                                <td key={cellIndex} className="px-2 py-1 text-gray-600">
                                  {String(value).substring(0, 50)}
                                  {String(value).length > 50 ? '...' : ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {sampleData.length > 3 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Mostrando 3 de {sampleData.length} registros
                        </p>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Processing Operations */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Operaciones de Procesamiento</h2>
              
              {/* Add Operation */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agregar Operación
                </label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => e.target.value && addProcessingOperation(e.target.value)}
                    value=""
                  >
                    <option value="">Seleccionar operación...</option>
                    {availableOperations.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Current Operations */}
              <div className="space-y-3">
                {formData.processingConfig.operations.map((operation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{operation.name}</div>
                      <div className="text-sm text-gray-600">{operation.description}</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeProcessingOperation(index)}
                    >
                      <FeatherIcon icon="x" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Revisión de Configuración</h2>
            
            <div className="space-y-4">
              <div>
                <div className="font-medium">Nombre:</div>
                <div className="text-gray-600">{formData.name}</div>
              </div>
              
              <div>
                <div className="font-medium">Dataset:</div>
                <div className="text-gray-600">
                  {datasets.find(d => d.id === formData.datasetId)?.name}
                </div>
              </div>
              
              <div>
                <div className="font-medium">Fuente de Datos:</div>
                <div className="text-gray-600 capitalize">{formData.harvestConfig.source_type}</div>
        </div>

              <div>
                <div className="font-medium">Mapeo de Columnas:</div>
                <div className="text-gray-600">
                  {Object.keys(formData.harvestConfig.column_mapping || {}).length} columna(s) mapeada(s)
                </div>
                {Object.keys(formData.harvestConfig.column_mapping || {}).length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {Object.entries(formData.harvestConfig.column_mapping || {}).map(([source, target]) => (
                      <div key={source}>{source} → {target}</div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="font-medium">Operaciones de Procesamiento:</div>
                <div className="text-gray-600">
                  {formData.processingConfig.operations.length} operación(es) configurada(s)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Anterior
              </Button>
            )}
          </div>
          <div className="flex gap-2">
          <Button 
            type="button" 
              variant="outline"
            onClick={() => navigate('/integrations')} 
          >
            Cancelar
          </Button>
            {currentStep < 4 ? (
              <Button type="button" onClick={nextStep}>
                Siguiente
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Integración'}
          </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default IntegrationCreate; 