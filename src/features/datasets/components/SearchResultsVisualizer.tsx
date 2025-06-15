import React, { useState, useMemo } from 'react';
import { DatasetRow, DatasetColumn } from '@/types/dataset';
import PageSizeSelector from '@/components/ui/PageSizeSelector';
import FeatherIcon from 'feather-icons-react';

interface SearchResultsVisualizerProps {
  results: DatasetRow[];
  columns: DatasetColumn[];
  query: string;
  relevanceScores?: Record<string, number>; // Map of row ID to relevance score (0-100)
  highlightedFields?: Record<string, string[]>; // Map of row ID to array of field names that matched
  pagination?: {
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    isSearchActive: boolean;
    pageSizeOptions: number[];
    rowCount: number;
    currentOffset: number;
    disabled: boolean;
  };
}

const SearchResultsVisualizer: React.FC<SearchResultsVisualizerProps> = ({
  results,
  columns,
  query,
  relevanceScores = {},
  highlightedFields = {},
  pagination,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'relevance'>('table');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  // Helper to highlight matching text
  const highlightMatches = (text: string, searchQuery: string) => {
    if (!searchQuery.trim() || !text) return text;
    
    try {
      const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.toString().replace(regex, '<mark class="bg-yellow-200 rounded px-1">$1</mark>');
    } catch (e) {
      return text;
    }
  };

  // Sorting logic from DatasetTable
  const sortedResults = useMemo(() => {
    const resultsCopy = [...results];
    if (sortConfig !== null) {
      resultsCopy.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return resultsCopy;
  }, [results, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key: string) => {
    if (!sortConfig) {
      return '';
    }
    return sortConfig.key === key ? sortConfig.direction : '';
  };

  // Format cell value based on column type
  const formatCellValue = (value: any, type: string): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-300">-</span>;
    }

    switch (type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'object':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  };

  const renderTableView = () => (
    <div className="w-full border border-gray-200 rounded-lg">
      {results.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>No data available</p>
        </div>
      ) : (
        <div className="block w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {viewMode === 'relevance' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relevance
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    onClick={() => requestSort(column.name)}
                    className={`
                      px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer
                      ${getSortDirection(column.name) ? 'bg-gray-100' : ''}
                    `}
                    style={{ minWidth: '150px' }}
                  >
                    <div className="flex items-center">
                      <span>{column.name}</span>
                      <span className="ml-1">
                        {getSortDirection(column.name) === 'ascending' ? (
                          <FeatherIcon icon="chevron-up" size={14} />
                        ) : getSortDirection(column.name) === 'descending' ? (
                          <FeatherIcon icon="chevron-down" size={14} />
                        ) : (
                          ''
                        )}
                      </span>
                    </div>
                    {column.description && (
                      <span className="block text-xs font-normal text-gray-400 normal-case">
                        {column.description}
                      </span>
                    )}
                  </th>
                ))}
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedResults.map((row) => {
                const rowRelevance = relevanceScores[row.id] || 0;
                const matchedFields = highlightedFields[row.id] || [];
                
                return (
                  <React.Fragment key={row.id}>
                    <tr 
                      className={`hover:bg-gray-50 ${expandedRow === row.id ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleRowExpansion(row.id)}
                    >
                      {viewMode === 'relevance' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(100, rowRelevance)}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-500">{rowRelevance}%</span>
                          </div>
                        </td>
                      )}
                      {columns.map((column) => {
                        const cellValue = row[column.name] || '';
                        const isHighlighted = matchedFields.includes(column.name);
                        
                        return (
                          <td 
                            key={`${row.id}-${column.id}`} 
                            className={`px-6 py-4 whitespace-nowrap text-sm ${isHighlighted ? 'font-medium' : 'text-gray-500'}`}
                          >
                            {isHighlighted ? (
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightMatches(cellValue.toString(), query) 
                                }} 
                              />
                            ) : (
                              formatCellValue(cellValue, column.type)
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(row.id);
                          }}
                        >
                          {expandedRow === row.id ? (
                            <FeatherIcon icon="chevron-up" size={16} className="inline mr-1" />
                          ) : (
                            <FeatherIcon icon="chevron-down" size={16} className="inline mr-1" />
                          )}
                          {expandedRow === row.id ? 'Collapse' : 'Expand'}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === row.id && (
                      <tr className="bg-blue-50">
                        <td colSpan={columns.length + (viewMode === 'relevance' ? 2 : 1)} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {columns.map((column) => {
                              const cellValue = row[column.name] || '';
                              const isHighlighted = matchedFields.includes(column.name);
                              
                              return (
                                <div key={`detail-${row.id}-${column.id}`} className="mb-2">
                                  <h4 className="text-sm font-medium text-gray-700">{column.name}</h4>
                                  <div 
                                    className={`mt-1 text-sm ${isHighlighted ? 'bg-yellow-50 p-2 rounded' : ''}`}
                                  >
                                    {isHighlighted ? (
                                      <div 
                                        dangerouslySetInnerHTML={{ 
                                          __html: highlightMatches(cellValue.toString(), query) 
                                        }} 
                                      />
                                    ) : (
                                      formatCellValue(cellValue, column.type)
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedResults.map((row) => {
        const rowRelevance = relevanceScores[row.id] || 0;
        const matchedFields = highlightedFields[row.id] || [];
        
        // Find the first matched field to use as title
        const titleField = matchedFields.length > 0 
          ? matchedFields[0] 
          : columns.length > 0 ? columns[0].name : '';
        
        // Get a preview of matched content
        const previewField = matchedFields.length > 0 
          ? matchedFields[matchedFields.length > 1 ? 1 : 0] 
          : columns.length > 1 ? columns[1].name : titleField;
        
        return (
          <div 
            key={row.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              {viewMode === 'relevance' && (
                <div className="flex items-center mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, rowRelevance)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">{rowRelevance}%</span>
                </div>
              )}
              
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {row[titleField] ? formatCellValue(row[titleField], columns.find(c => c.name === titleField)?.type || 'string') : 'Untitled'}
              </h3>
              
              <div className="mt-2 text-sm text-gray-500">
                {previewField && row[previewField] && (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatches(
                        row[previewField].toString().substring(0, 150) + 
                        (row[previewField].toString().length > 150 ? '...' : ''),
                        query
                      ) 
                    }} 
                  />
                )}
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {matchedFields.length} {matchedFields.length === 1 ? 'match' : 'matches'}
                </span>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-900"
                  onClick={() => toggleRowExpansion(row.id)}
                >
                  {expandedRow === row.id ? (
                    <>
                      <FeatherIcon icon="chevron-up" size={14} className="inline mr-1" />
                      Less details
                    </>
                  ) : (
                    <>
                      <FeatherIcon icon="chevron-down" size={14} className="inline mr-1" />
                      More details
                    </>
                  )}
                </button>
              </div>
              
              {expandedRow === row.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {columns.map((column) => {
                    const cellValue = row[column.name] || '';
                    const isHighlighted = matchedFields.includes(column.name);
                    
                    return (
                      <div key={`card-detail-${row.id}-${column.id}`} className="mb-3">
                        <h4 className="text-xs font-medium text-gray-700">{column.name}</h4>
                        <div 
                          className={`mt-1 text-sm ${isHighlighted ? 'bg-yellow-50 p-1 rounded' : ''}`}
                        >
                          {isHighlighted ? (
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: highlightMatches(cellValue.toString(), query) 
                              }} 
                            />
                          ) : (
                            formatCellValue(cellValue, column.type)
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          {results.length} {results.length === 1 ? 'result' : 'results'} 
          {query ? ` for "${query}"` : ''}
        </h2>
        
        <div className="flex space-x-1 rounded-md shadow-sm">
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium rounded-l-md ${
              viewMode === 'table' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('table')}
          >
            <FeatherIcon icon="list" size={14} className="inline mr-1" />
            Table
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium ${
              viewMode === 'cards' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('cards')}
          >
            <FeatherIcon icon="grid" size={14} className="inline mr-1" />
            Cards
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium rounded-r-md ${
              viewMode === 'relevance' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('relevance')}
          >
            <FeatherIcon icon="bar-chart-2" size={14} className="inline mr-1" />
            Relevance
          </button>
        </div>
      </div>
      
      {pagination && !pagination.isSearchActive && (
        <div className="flex justify-between items-center mb-4">
          <PageSizeSelector
            options={pagination.pageSizeOptions}
            value={pagination.pageSize}
            onChange={pagination.onPageSizeChange}
            disabled={pagination.disabled}
          />
          <div className="text-sm text-gray-500">
            Showing rows {pagination.currentOffset + 1} to {Math.min(pagination.currentOffset + pagination.pageSize, pagination.rowCount)} of {pagination.rowCount}
          </div>
        </div>
      )}
      
      {results.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No results found for your search.</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        viewMode === 'cards' ? renderCardView() : renderTableView()
      )}
    </div>
  );
};

export default SearchResultsVisualizer; 