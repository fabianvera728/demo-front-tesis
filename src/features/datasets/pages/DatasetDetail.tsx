import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { datasetService } from '@/services/datasetService';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import SemanticSearchInput, { SearchOptions } from '@/components/ui/SemanticSearchInput';
import SearchResultsVisualizer from '../components/SearchResultsVisualizer';
import DataVisualizations from '../components/DataVisualizations';
import Pagination from '@/components/ui/Pagination';
import { DatasetDetail as DatasetDetailType, DatasetRow } from '@/types/dataset';
import { usePagination } from '@/utils/usePagination';
import FeatherIcon from 'feather-icons-react';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

const DatasetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for the dataset metadata (without rows)
  const [dataset, setDataset] = useState<DatasetDetailType | null>(null);
  
  // State for rows with pagination
  const [rows, setRows] = useState<DatasetRow[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  
  // Search-related state
  const [filteredRows, setFilteredRows] = useState<DatasetRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    mode: 'semantic',
    threshold: 70,
    includeFields: ['all'],
  });
  const [relevanceScores, setRelevanceScores] = useState<Record<string, number>>({});
  const [highlightedFields, setHighlightedFields] = useState<Record<string, string[]>>({});
  
  // Initial dataset loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state and handlers
  const pagination = usePagination(DEFAULT_PAGE_SIZE, 1, 0);

  // Fetch dataset metadata (without rows)
  useEffect(() => {
    const fetchDataset = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await datasetService.getDatasetById(id);
        setDataset(data);
        pagination.setTotalItems(data.rowCount);
      } catch (err) {
        setError('Failed to load dataset. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataset();
  }, [id]);

  // Fetch rows with pagination
  useEffect(() => {
    const fetchRows = async () => {
      if (!id || !dataset) return;

      try {
        setIsLoadingRows(true);
        const paginatedRows = await datasetService.getDatasetRows(id, {
          limit: pagination.pageSize,
          offset: pagination.offset
        });
        
        setRows(paginatedRows.rows);
        
        // When not searching, filtered rows are the same as fetched rows
        if (!searchQuery) {
          setFilteredRows(paginatedRows.rows);
        }
      } catch (err) {
        setError('Failed to load dataset rows. Please try again later.');
      } finally {
        setIsLoadingRows(false);
      }
    };

    if (!isLoading) {
      fetchRows();
    }
  }, [id, pagination.pageSize, pagination.offset, isLoading, dataset]);

  const handleSearch = async (query: string, options: SearchOptions) => {
    setSearchQuery(query);
    setSearchOptions(options);
    
    if (!id || !dataset) return;
    
    if (query.trim() === '') {
      // When search is cleared, show regular paginated rows
      setFilteredRows(rows);
      setRelevanceScores({});
      setHighlightedFields({});
      return;
    }
    
    try {
      // Indicar que estamos cargando resultados
      setIsLoadingRows(true);
      
      const results = await datasetService.searchDatasetRows(id, query, options);
      setFilteredRows(results);
      
      // Crear mapas para scores de relevancia y campos destacados
      const relevanceScoresMap: Record<string, number> = {};
      const highlightedFieldsMap: Record<string, string[]> = {};
      
      results.forEach(row => {
        // Los scores vienen como valores entre 0 y 1, convertimos a porcentaje
        // Asegurando que nunca superen el 100%
        relevanceScoresMap[row.id] = Math.min(100, Math.round((row.score || 0) * 100));
        
        // Usar metadata de campos destacados si está disponible
        if (row.metadata && row.metadata.matched_fields) {
          highlightedFieldsMap[row.id] = row.metadata.matched_fields;
        } else if (row.metadata && row.metadata.semantic_score && row.metadata.keyword_score) {
          // Para búsqueda híbrida, destacar campos basados en las puntuaciones individuales
          const highestScoringFields = dataset.columns
            .filter(col => 
              // Simulamos detección de campos más relevantes
              // En una implementación real, esto vendría del backend
              Math.random() > 0.6
            )
            .map(col => col.name);
            
          highlightedFieldsMap[row.id] = highestScoringFields.length > 0 
            ? highestScoringFields 
            : [dataset.columns[0]?.name].filter(Boolean);
        } else {
          // Fallback a selección aleatoria para demostración
          const fieldsToHighlight = dataset.columns
            .filter(() => Math.random() > 0.5)
            .map(col => col.name);
          
          if (fieldsToHighlight.length === 0 && dataset.columns.length > 0) {
            fieldsToHighlight.push(dataset.columns[0].name);
          }
          
          highlightedFieldsMap[row.id] = fieldsToHighlight;
        }
      });
      
      setRelevanceScores(relevanceScoresMap);
      setHighlightedFields(highlightedFieldsMap);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoadingRows(false);
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

  const handlePageChange = (page: number) => {
    // Reset search when changing pages in regular view
    if (searchQuery) {
      setSearchQuery('');
    }
    pagination.goToPage(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    // Reset search when changing page size
    if (searchQuery) {
      setSearchQuery('');
    }
    pagination.setPageSize(pageSize);
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

  const displayedRows = searchQuery ? filteredRows : rows;
  const isSearchActive = searchQuery.trim() !== '';

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
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">{filteredRows.length}</span> results found for "{searchQuery}"
            <button
              className="ml-2 text-blue-500 hover:text-blue-700"
              onClick={() => {
                setSearchQuery('');
                setFilteredRows(rows);
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </div>
      
      {isLoadingRows ? (
        <div className="flex justify-center my-8">
          <LoadingSpinner text="Loading data..." size="small" />
        </div>
      ) : (
        <>
          {displayedRows.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Visualizaciones</h2>
                <DataVisualizations
                  results={displayedRows}
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
                  results={displayedRows}
                  columns={dataset.columns}
                  query={searchQuery}
                  relevanceScores={relevanceScores}
                  highlightedFields={highlightedFields}
                  pagination={{
                    pageSize: pagination.pageSize,
                    onPageSizeChange: handlePageSizeChange,
                    isSearchActive,
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    rowCount: dataset.rowCount,
                    currentOffset: pagination.offset,
                    disabled: isLoadingRows
                  }}
                />
              </div>
              
              {!isSearchActive && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  disabled={isLoadingRows}
                />
              )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <FeatherIcon icon="database" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm mt-2">
                {isSearchActive 
                  ? 'No results match your search criteria. Try adjusting your search terms.'
                  : 'This dataset appears to be empty.'}
              </p>
            </div>
          )}
        </>
      )}

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
          Are you sure you want to delete this dataset? This action cannot be undone, and all associated data will be permanently removed.
        </p>
        <div className="mt-4 p-3 bg-yellow-50 rounded-md text-yellow-800 text-sm">
          <p className="font-semibold flex items-center">
            <FeatherIcon icon="alert-triangle" className="mr-2" size={16} />
            Warning
          </p>
          <p className="mt-1">Deleting this dataset will permanently remove all {dataset.rowCount} rows of data.</p>
        </div>
      </Modal>
    </div>
  );
};

export default DatasetDetail; 