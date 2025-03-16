import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { datasetService } from '@/services/datasetService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { UpdateDatasetPayload, DatasetDetail } from '@/types/dataset';

const DatasetEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
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

  useEffect(() => {
    const fetchDataset = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await datasetService.getDatasetById(id);
        setDataset(data);
        
        // Initialize form data
        setFormData({
          name: data.name,
          description: data.description || '',
          tags: data.tags.join(', '),
          isPublic: data.isPublic,
        });
      } catch (err) {
        setError('Failed to load dataset. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataset();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Dataset name is required');
      return;
    }
    
    if (!id) return;
    
    try {
      setIsSaving(true);
      
      const payload: UpdateDatasetPayload = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPublic: formData.isPublic,
      };
      
      await datasetService.updateDataset(id, payload);
      navigate(`/datasets/${id}`);
    } catch (err) {
      setError('Failed to update dataset. Please try again.');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      setIsConfirmModalOpen(true);
    } else {
      navigateBack();
    }
  };

  const navigateBack = () => {
    navigate(`/datasets/${id}`);
  };

  const hasChanges = (): boolean => {
    if (!dataset) return false;
    
    return (
      formData.name !== dataset.name ||
      formData.description !== (dataset.description || '') ||
      formData.tags !== dataset.tags.join(', ') ||
      formData.isPublic !== dataset.isPublic
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading dataset..." />;
  }

  if (error && !dataset) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={navigateBack}>Back to Dataset</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-full overflow-x-hidden">
      <div className="flex items-center mb-6">
        <button 
          className="flex items-center text-gray-600 hover:text-blue-600 mr-4" 
          onClick={handleCancel}
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Dataset</h1>
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
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Unsaved Changes"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Continue Editing
            </Button>
            <Button variant="primary" onClick={navigateBack}>
              Discard Changes
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          You have unsaved changes. Are you sure you want to leave this page?
        </p>
        <p className="text-gray-700 mt-2">
          Your changes will be lost if you don't save them.
        </p>
      </Modal>
    </div>
  );
};

export default DatasetEdit; 