import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { datasetService } from '@/services/datasetService';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SearchInput from '@/components/ui/SearchInput';
import DatasetTable from '../components/DatasetTable';
import { DatasetDetail as DatasetDetailType } from '@/types/dataset';

const DatasetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<DatasetDetailType | null>(null);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDataset = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await datasetService.getDatasetById(id);
        setDataset(data);
        setFilteredRows(data.rows);
      } catch (err) {
        setError('Failed to load dataset. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataset();
  }, [id]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!id || !dataset) return;
    
    if (query.trim() === '') {
      setFilteredRows(dataset.rows);
      return;
    }
    
    try {
      const results = await datasetService.searchDatasetRows(id, query);
      setFilteredRows(results);
    } catch (err) {
      console.error('Search error:', err);
      // Keep the current rows on error
    }
  };

  const handleBack = () => {
    navigate('/datasets');
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/datasets/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      try {
        await datasetService.deleteDataset(id);
        navigate('/datasets');
      } catch (err) {
        alert('Failed to delete dataset. Please try again.');
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading dataset..." />;
  }

  if (error || !dataset) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error || 'Dataset not found'}</p>
        <Button onClick={handleBack}>Back to Datasets</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
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
          <h1 className="text-2xl font-bold text-gray-900 truncate">{dataset.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>Edit</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">{dataset.description}</p>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex space-x-6 mb-4 sm:mb-0">
            <div className="text-center">
              <span className="block text-xl font-semibold text-blue-600">{dataset.rowCount}</span>
              <span className="text-sm text-gray-500">Rows</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-semibold text-blue-600">{dataset.columnCount}</span>
              <span className="text-sm text-gray-500">Columns</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {dataset.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <SearchInput 
          placeholder="Search in dataset..." 
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      
      <div className="w-full">
        <DatasetTable 
          columns={dataset.columns} 
          rows={filteredRows} 
        />
      </div>
    </div>
  );
};

export default DatasetDetail; 