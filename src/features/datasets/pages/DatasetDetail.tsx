import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { datasetService } from '@/services/datasetService';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import SemanticSearchInput, { SearchOptions } from '@/components/ui/SemanticSearchInput';
import SearchResultsVisualizer from '../components/SearchResultsVisualizer';
import DataVisualizations from '../components/DataVisualizations';
import { DatasetDetail as DatasetDetailType } from '@/types/dataset';
import FeatherIcon from 'feather-icons-react';

const DatasetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<DatasetDetailType | null>(null);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    mode: 'semantic',
    threshold: 70,
    includeFields: ['all'],
  });
  
  const [relevanceScores, setRelevanceScores] = useState<Record<string, number>>({});
  const [highlightedFields, setHighlightedFields] = useState<Record<string, string[]>>({});

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

  const handleSearch = async (query: string, options: SearchOptions) => {
    setSearchQuery(query);
    setSearchOptions(options);
    
    if (!id || !dataset) return;
    
    if (query.trim() === '') {
      setFilteredRows(dataset.rows);
      setRelevanceScores({});
      setHighlightedFields({});
      return;
    }
    
    try {
      const results = await datasetService.searchDatasetRows(id, query);
      setFilteredRows(results);
      
      const mockRelevanceScores: Record<string, number> = {};
      const mockHighlightedFields: Record<string, string[]> = {};
      
      results.forEach(row => {
        const minRelevance = options.mode === 'exact' ? 100 : options.threshold;
        mockRelevanceScores[row.id] = Math.floor(Math.random() * (100 - minRelevance + 1)) + minRelevance;
        
        const fieldsToHighlight = dataset.columns
          .filter(() => Math.random() > 0.5)
          .map(col => col.name);
        
        if (fieldsToHighlight.length === 0 && dataset.columns.length > 0) {
          fieldsToHighlight.push(dataset.columns[0].name);
        }
        
        mockHighlightedFields[row.id] = fieldsToHighlight;
      });
      
      setRelevanceScores(mockRelevanceScores);
      setHighlightedFields(mockHighlightedFields);
    } catch (err) {
      console.error('Search error:', err);
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

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await datasetService.deleteDataset(id);
      closeDeleteModal();
      navigate('/datasets');
    } catch (err) {
      setIsDeleting(false);
      setError('Failed to delete dataset. Please try again.');
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
            <FeatherIcon icon="arrow-left" className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 truncate">{dataset.name}</h1>
        </div>
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={openDeleteModal}
          >
            Delete
          </Button>
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
        <SemanticSearchInput 
          placeholder="Search in dataset (try semantic search)..." 
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Visualizaciones</h2>
        <DataVisualizations
          results={filteredRows}
          columns={dataset.columns}
          query={searchQuery || ""}
          relevanceScores={relevanceScores}
          highlightedFields={highlightedFields}
          onWordClick={(word) => {
            setSearchQuery(word);
            handleSearch(word, searchOptions);
          }}
        />
      </div>
      
      <div className="w-full">
        <SearchResultsVisualizer 
          results={filteredRows}
          columns={dataset.columns}
          query={searchQuery}
          relevanceScores={relevanceScores}
          highlightedFields={highlightedFields}
        />
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Dataset"
        footer={
          <>
            <Button 
              type="button"
              variant="outline" 
              onClick={closeDeleteModal} 
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="danger" 
              onClick={handleDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete the dataset <span className="font-semibold">{dataset.name}</span>?
        </p>
        <p className="text-gray-700 mt-2">
          This action cannot be undone and all data will be permanently lost.
        </p>
      </Modal>
    </div>
  );
};

export default DatasetDetail; 