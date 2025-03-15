import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { datasetService } from '@/services/datasetService';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DatasetCard from '../components/DatasetCard';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import { Dataset } from '@/types/dataset';

const DatasetList: React.FC = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setIsLoading(true);
        const data = await datasetService.getAllDatasets();
        setDatasets(data);
        setFilteredDatasets(data);
      } catch (err) {
        setError('Failed to load datasets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDatasets(datasets);
    } else {
      const filtered = datasets.filter(dataset => 
        dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDatasets(filtered);
    }
  }, [searchQuery, datasets]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateDataset = () => {
    navigate('/datasets/create');
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading datasets..." />;
  }

  if (error) {
    return (
      <div className="text-center bg-white rounded-lg shadow-sm p-6">
        <p className="text-rose-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Datasets</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput 
              placeholder="Search datasets..." 
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button onClick={handleCreateDataset}>Create Dataset</Button>
        </div>
      </div>

      {datasets.length === 0 ? (
        <EmptyState
          title="No datasets yet"
          description="Create your first dataset to get started"
          actionLabel="Create Dataset"
          onAction={handleCreateDataset}
        />
      ) : filteredDatasets.length === 0 ? (
        <EmptyState
          title="No results found"
          description={`No datasets match "${searchQuery}"`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map(dataset => (
            <Link to={`/datasets/${dataset.id}`} key={dataset.id} className="block">
              <DatasetCard dataset={dataset} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatasetList; 