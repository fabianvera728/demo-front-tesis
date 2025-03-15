import React, { useState } from 'react';
import { DatasetColumn, DatasetRow } from '@/types/dataset';

interface DatasetTableProps {
  columns: DatasetColumn[];
  rows: DatasetRow[];
}

const DatasetTable: React.FC<DatasetTableProps> = ({ columns, rows }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const sortedRows = React.useMemo(() => {
    const rowsCopy = [...rows];
    if (sortConfig !== null) {
      rowsCopy.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return rowsCopy;
  }, [rows, sortConfig]);

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

  return (
    <div className="overflow-x-auto">
      {rows.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>No data available</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  onClick={() => requestSort(column.name)}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer
                    ${getSortDirection(column.name) ? 'bg-gray-100' : ''}
                  `}
                >
                  <div className="flex items-center">
                    <span>{column.name}</span>
                    <span className="ml-1">
                      {getSortDirection(column.name) === 'ascending' ? '↑' : 
                       getSortDirection(column.name) === 'descending' ? '↓' : ''}
                    </span>
                  </div>
                  {column.description && (
                    <span className="block text-xs font-normal text-gray-400 normal-case">
                      {column.description}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td 
                    key={`${row.id}-${column.id}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {formatCellValue(row[column.name], column.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

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

export default DatasetTable; 