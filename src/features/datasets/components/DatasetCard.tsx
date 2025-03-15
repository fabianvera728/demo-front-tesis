import React from 'react';
import { Dataset } from '@/types/dataset';
import { formatDate } from '@/utils/dateUtils';

interface DatasetCardProps {
  dataset: Dataset;
}

const DatasetCard: React.FC<DatasetCardProps> = ({ dataset }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{dataset.name}</h3>
          <span className="text-xs text-gray-500">
            Created {formatDate(dataset.createdAt)}
          </span>
        </div>
        
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
          {dataset.description.length > 120
            ? `${dataset.description.substring(0, 120)}...`
            : dataset.description}
        </p>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="text-center">
              <span className="block text-lg font-semibold text-blue-600">{dataset.rowCount}</span>
              <span className="text-xs text-gray-500">Rows</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-semibold text-blue-600">{dataset.columnCount}</span>
              <span className="text-xs text-gray-500">Columns</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {dataset.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {tag}
              </span>
            ))}
            {dataset.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +{dataset.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetCard; 