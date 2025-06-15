import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { datasetService } from '@/services/datasetService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CreateDatasetPayload, DatasetColumn, EmbeddingPromptStrategy } from '@/types/dataset';
import FeatherIcon from 'feather-icons-react';

const DatasetCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    tags: string;
    isPublic: boolean;
  }>({
    name: '',
    description: '',
    tags: '',
    isPublic: false,
  });
  
  const [columns, setColumns] = useState<Array<Omit<DatasetColumn, 'id'>>>([
    { name: '', type: 'string' },
  ]);
  
  const [csvData, setCsvData] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Estado para configuración de embeddings contextuales
  const [embeddingConfig, setEmbeddingConfig] = useState<{
    useCustomPrompt: boolean;
    promptType: 'simple' | 'template';
    simplePrompt: string;
    promptTemplate: string;
    previewText: string;
  }>({
    useCustomPrompt: false,
    promptType: 'simple',
    simplePrompt: '',
    promptTemplate: '',
    previewText: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleColumnChange = (index: number, field: keyof Omit<DatasetColumn, 'id'>, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'string' }]);
  };

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCsvData = e.target.value;
    setCsvData(newCsvData);
    
    // Reset preview
    setShowPreview(false);
    
    // Auto-update columns based on CSV headers
    if (newCsvData.trim()) {
      try {
        // Parse first line to get headers
        const firstLine = newCsvData.trim().split('\n')[0];
        if (!firstLine) return;
        
        // Detect delimiter
        let delimiter = ',';
        const commaCount = (firstLine.match(/,/g) || []).length;
        const semicolonCount = (firstLine.match(/;/g) || []).length;
        const tabCount = (firstLine.match(/\t/g) || []).length;
        
        if (semicolonCount > commaCount && semicolonCount > tabCount) {
          delimiter = ';';
        } else if (tabCount > commaCount && tabCount > semicolonCount) {
          delimiter = '\t';
        }
        
        // Parse headers
        const headers = splitCSVLine(firstLine, delimiter);
        
        // Update columns state with the CSV headers
        if (headers.length > 0) {
          const newColumns = headers.map(header => ({
            name: header.trim(),
            type: 'string' as const
          }));
          
          // Only update if headers are different from current columns
          const currentColumnNames = columns.map(col => col.name);
          const newColumnNames = newColumns.map(col => col.name);
          
          // Check if arrays are different
          const isDifferent = newColumnNames.length !== currentColumnNames.length ||
            newColumnNames.some((name, i) => name !== currentColumnNames[i]);
          
          if (isDifferent) {
            setColumns(newColumns);
          }
        }
      } catch (e) {
        console.error('Error parsing CSV headers:', e);
      }
    }
  };

  const parseCSV = (): any[] => {
    if (!csvData.trim()) return [];
    
    // Split by newline and filter empty lines
    const lines = csvData.trim().split('\n').filter(line => line.trim());
    if (lines.length <= 1) return [];
    
    // Try to detect delimiter - check for common delimiters (comma, semicolon, tab)
    const firstLine = lines[0];
    let delimiter = ','; // default
    
    // Count occurrences of potential delimiters in first line
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    
    // Choose the most frequent delimiter
    if (semicolonCount > commaCount && semicolonCount > tabCount) {
      delimiter = ';';
    } else if (tabCount > commaCount && tabCount > semicolonCount) {
      delimiter = '\t';
    }
    
    // Parse headers
    const headers = splitCSVLine(lines[0], delimiter);
    
    // Parse data rows
    return lines.slice(1).map((line, index) => {
      const values = splitCSVLine(line, delimiter);
      const row: any = { id: `temp-${index}` };
      
      headers.forEach((header, i) => {
        // Trim header names to handle possible spaces
        const cleanHeader = header.trim();
        // Only assign if there's a value in this position
        if (i < values.length) {
          // Asegúrate de que el valor no sea null o undefined
          row[cleanHeader] = values[i] !== undefined && values[i] !== null ? values[i] : '';
        } else {
          row[cleanHeader] = ''; // Add empty string for missing values
        }
      });
      
      // Verificar que el objeto row tiene realmente datos (aparte del id)
      const hasData = Object.keys(row).some(key => key !== 'id' && row[key] !== '');
      if (!hasData) {
        console.warn('Fila sin datos detectada:', row);
      }
      
      return row;
    });
  };
  
  // Helper function to correctly split CSV lines respecting quotes
  const splitCSVLine = (line: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Toggle the inQuotes flag
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        // Only split on delimiter if not inside quotes
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current);
    
    // Trim quotes and whitespace from each value
    return result.map(value => {
      let trimmed = value.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        trimmed = trimmed.substring(1, trimmed.length - 1);
      }
      return trimmed;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Dataset name is required');
      return;
    }
    
    if (columns.some(col => !col.name.trim())) {
      setError('All columns must have a name');
      return;
    }
    
    // Parse CSV data
    const rows = parseCSV();
    
    // Validate that we have data
    if (rows.length === 0) {
      setError('No data found in CSV. Please check the format and try again.');
      return;
    }
    
    // Log para depuración
    console.log('Rows a enviar:', rows);
    
    // Validate that all rows have the expected columns
    const columnNames = columns.map(col => col.name.trim());
    const firstRowKeys = Object.keys(rows[0]).filter(key => key !== 'id');
    
    // Check if column names match the CSV headers
    const missingColumns = columnNames.filter(name => !firstRowKeys.includes(name));
    if (missingColumns.length > 0) {
      setError(`The following columns defined don't match the CSV data: ${missingColumns.join(', ')}`);
      return;
    }
    
    // Ensure all rows have data for at least one column
    const validRows = rows.filter(row => {
      return Object.keys(row).some(key => key !== 'id' && row[key] !== '');
    });
    
    if (validRows.length === 0) {
      setError('No valid data found in CSV. All rows appear to be empty.');
      return;
    }
    
    if (validRows.length < rows.length) {
      console.warn(`Filtered out ${rows.length - validRows.length} empty rows`);
    }
    
    try {
      setIsLoading(true);
      
      // Construir la estrategia de prompt si está habilitada
      let promptStrategy: EmbeddingPromptStrategy | undefined;
      
      if (embeddingConfig.useCustomPrompt) {
        if (embeddingConfig.promptType === 'simple' && embeddingConfig.simplePrompt.trim()) {
          promptStrategy = {
            strategy_type: 'simple_prompt',
            simple_prompt: embeddingConfig.simplePrompt.trim()
          };
        } else if (embeddingConfig.promptType === 'template' && embeddingConfig.promptTemplate.trim()) {
          promptStrategy = {
            strategy_type: 'template',
            prompt_template: {
              template: embeddingConfig.promptTemplate.trim(),
              description: `Template personalizado para dataset: ${formData.name}`,
              field_mappings: {},
              metadata: {
                created_at: new Date().toISOString(),
                created_by: 'user' // TODO: obtener del contexto de usuario
              }
            }
          };
        }
      }

      const payload: CreateDatasetPayload = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPublic: formData.isPublic,
        columns,
        rows: validRows, // Use the filtered valid rows
        prompt_strategy: promptStrategy // Agregar la estrategia de prompt
      };
      
      const createdDataset = await datasetService.createDataset(payload);
      navigate(`/datasets/${createdDataset.id}`);
    } catch (err) {
      setError('Failed to create dataset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/datasets');
  };

  const handleBack = () => {
    navigate('/datasets');
  };

  const generatePreview = () => {
    const rows = parseCSV();
    setPreviewData(rows.slice(0, 5)); // Show only first 5 rows
    setShowPreview(true);
  };

  const generatePromptPreview = () => {
    const rows = parseCSV();
    if (rows.length === 0) {
      setEmbeddingConfig(prev => ({
        ...prev,
        previewText: 'No hay datos disponibles para la vista previa'
      }));
      return;
    }

    const sampleRow = rows[0];
    let previewText = '';

    if (embeddingConfig.promptType === 'simple' && embeddingConfig.simplePrompt) {
      // Para prompt simple, concatenar campos de texto
      const textFields = Object.entries(sampleRow)
        .filter(([key, value]) => key !== 'id' && typeof value === 'string' && value.trim())
        .map(([, value]) => value)
        .join(' ');
      
      previewText = `${embeddingConfig.simplePrompt}: ${textFields}`;
    } else if (embeddingConfig.promptType === 'template' && embeddingConfig.promptTemplate) {
      // Para template, reemplazar placeholders
      try {
        previewText = embeddingConfig.promptTemplate;
        Object.entries(sampleRow).forEach(([key, value]) => {
          const placeholder = `{${key}}`;
          previewText = previewText.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
            value || 'N/A');
        });
      } catch (error) {
        previewText = 'Error en el template. Verifique la sintaxis.';
      }
    }

    setEmbeddingConfig(prev => ({
      ...prev,
      previewText
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-full overflow-x-hidden">
      <div className="flex items-center mb-6">
        <button 
          className="flex items-center text-gray-600 hover:text-blue-600 mr-4" 
          onClick={handleBack}
        >
          <FeatherIcon 
            icon="arrow-left" 
            className="h-5 w-5 mr-1" 
          />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Dataset</h1>
      </div>
      
      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}
      
      <form onSubmit={handleSubmit} className="overflow-x-hidden">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          
          <Input
            label="Dataset Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <Input
            label="Tags (comma separated)"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            helperText="Example: finance, analysis, quarterly"
          />
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make this dataset public
            </label>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Columns</h2>
          <p className="text-sm text-gray-500 mb-4">
            Define the structure of your dataset
          </p>
          
          <div className="space-y-3 mb-4">
            {columns.map((column, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-2">
                <div className="w-full md:flex-1">
                  <Input
                    label={index === 0 ? "Column Name" : ""}
                    value={column.name}
                    onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="w-full md:w-40">
                  <div className="mb-1">
                    {index === 0 && <label className="block text-sm font-medium text-gray-700">Type</label>}
                  </div>
                  <select
                    value={column.type}
                    onChange={(e) => handleColumnChange(index, 'type', e.target.value as any)}
                    className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="string">Text</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="date">Date</option>
                    <option value="object">Object</option>
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeColumn(index)}
                  className="p-3 mb-4 rounded-full text-gray-400 hover:text-red-500 focus:outline-none"
                  disabled={columns.length <= 1}
                  aria-label="Remove column"
                >
                  <FeatherIcon 
                    icon="x-circle" 
                    className="h-5 w-5" 
                  />
                </button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addColumn}
              className="mt-2"
            >
              Add Column
            </Button>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Data</h2>
          <p className="text-sm text-gray-500 mb-4">
            Paste your CSV data below (first row should be column names)
          </p>
          
          <div className="mb-4">
            <textarea
              id="csvData"
              value={csvData}
              onChange={handleCsvChange}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="name,age,email\nJohn Doe,30,john@example.com\nJane Smith,25,jane@example.com"
            />
          </div>
            
          <Button
            type="button"
            variant="outline"
            onClick={generatePreview}
            disabled={!csvData.trim()}
            className="mb-4"
          >
            Preview Data
          </Button>
              
          {showPreview && previewData.length > 0 && (
            <div className="mt-4 mb-6 overflow-x-auto">
              <h3 className="text-md font-medium text-gray-700 mb-2">Data Preview (first 5 rows)</h3>
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0])
                      .filter(key => key !== 'id')
                      .map((key, index) => (
                        <th 
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.keys(row)
                        .filter(key => key !== 'id')
                        .map((key, cellIndex) => (
                          <td 
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {String(row[key])}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Nueva sección: Configuración de Embeddings Contextuales */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de Embeddings</h2>
          <p className="text-sm text-gray-500 mb-4">
            Configure cómo se generarán los embeddings para mejorar la búsqueda semántica
          </p>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={embeddingConfig.useCustomPrompt}
                onChange={(e) => setEmbeddingConfig(prev => ({
                  ...prev,
                  useCustomPrompt: e.target.checked,
                  previewText: '' // Reset preview when toggling
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Usar prompt personalizado para generar embeddings contextuales
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Esto mejorará la calidad de las búsquedas semánticas al estructurar mejor el contenido
            </p>
          </div>

          {embeddingConfig.useCustomPrompt && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Prompt
                </label>
                <select
                  value={embeddingConfig.promptType}
                  onChange={(e) => setEmbeddingConfig(prev => ({
                    ...prev,
                    promptType: e.target.value as 'simple' | 'template',
                    previewText: '' // Reset preview when changing type
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="simple">Prompt Simple</option>
                  <option value="template">Template Avanzado</option>
                </select>
              </div>

              {embeddingConfig.promptType === 'simple' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del Contenido
                  </label>
                  <input
                    type="text"
                    value={embeddingConfig.simplePrompt}
                    onChange={(e) => setEmbeddingConfig(prev => ({
                      ...prev,
                      simplePrompt: e.target.value,
                      previewText: '' // Reset preview when changing
                    }))}
                    placeholder="Ej: Registro de cliente con información personal y preferencias"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Esta descripción se agregará como prefijo a todos los registros
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template de Prompt
                  </label>
                  <textarea
                    value={embeddingConfig.promptTemplate}
                    onChange={(e) => setEmbeddingConfig(prev => ({
                      ...prev,
                      promptTemplate: e.target.value,
                      previewText: '' // Reset preview when changing
                    }))}
                    placeholder="Ej: Cliente {nombre} de {edad} años, ubicado en {ciudad}, con preferencia por {categoria_producto}"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {`{nombre_columna}`} para insertar valores de las columnas. Columnas disponibles: {columns.map(col => col.name).filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  onClick={generatePromptPreview} 
                  variant="outline"
                  disabled={
                    !csvData.trim() || 
                    (embeddingConfig.promptType === 'simple' && !embeddingConfig.simplePrompt.trim()) ||
                    (embeddingConfig.promptType === 'template' && !embeddingConfig.promptTemplate.trim())
                  }
                >
                  Vista Previa del Prompt
                </Button>
              </div>

              {embeddingConfig.previewText && (
                <div className="p-3 bg-white border rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Vista previa del embedding contextual:</strong>
                  </p>
                  <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">
                    "{embeddingConfig.previewText}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Dataset'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DatasetCreate; 