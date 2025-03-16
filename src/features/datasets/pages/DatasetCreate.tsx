import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { datasetService } from '@/services/datasetService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CreateDatasetPayload, DatasetColumn } from '@/types/dataset';

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
    setCsvData(e.target.value);
  };

  const parseCSV = (): any[] => {
    if (!csvData.trim()) return [];
    
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = { id: `temp-${index}` };
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      return row;
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
    
    try {
      setIsLoading(true);
      
      const payload: CreateDatasetPayload = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPublic: formData.isPublic,
        columns,
        rows,
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-full overflow-x-hidden">
      <div className="flex items-center mb-6">
        <button 
          className="flex items-center text-gray-600 hover:text-blue-600 mr-4" 
          onClick={handleBack}
        >
          <svg 
            className="h-5 w-5 mr-1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
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
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
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