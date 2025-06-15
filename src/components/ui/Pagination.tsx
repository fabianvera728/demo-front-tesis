import React from 'react';
import FeatherIcon from 'feather-icons-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false
}) => {
  const renderPageNumbers = () => {
    let pages = [];
    let startPage: number;
    let endPage: number;

    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`
            relative inline-flex items-center px-4 py-2 text-sm font-medium
            ${currentPage === i
              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            }
            border ${i === startPage ? 'rounded-l-md' : ''} ${i === endPage ? 'rounded-r-md' : ''}
          `}
          onClick={() => onPageChange(i)}
          disabled={disabled}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-between items-center mt-4">
      <div>
        <p className="text-sm text-gray-700">
          Showing page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
      </div>
      <div className="flex justify-end items-center">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
            className={`
              relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md
              ${currentPage === 1 || disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}
            `}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || disabled}
            className={`
              ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md
              ${currentPage === totalPages || disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}
            `}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || disabled}
              className={`
                relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium
                ${currentPage === 1 || disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}
              `}
            >
              <span className="sr-only">Previous</span>
              <FeatherIcon icon="chevron-left" size={18} />
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || disabled}
              className={`
                relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium
                ${currentPage === totalPages || disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}
              `}
            >
              <span className="sr-only">Next</span>
              <FeatherIcon icon="chevron-right" size={18} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination; 