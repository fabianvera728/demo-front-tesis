import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import FeatherIcon from 'feather-icons-react';

interface SemanticSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string, options: SearchOptions) => void;
  debounceTime?: number;
  className?: string;
}

export interface SearchOptions {
  mode: 'semantic' | 'exact' | 'hybrid';
  threshold: number; // 0-100 relevance threshold
  includeFields: string[]; // fields to search in
}

const SemanticSearchInput: React.FC<SemanticSearchInputProps> = ({
  placeholder = 'Search semantically...',
  value,
  onChange,
  debounceTime = 300,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    mode: 'semantic',
    threshold: 70,
    includeFields: ['all'],
  });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue, searchOptions);
    }, debounceTime);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('', searchOptions);
  };

  const handleOptionChange = (option: Partial<SearchOptions>) => {
    const newOptions = { ...searchOptions, ...option };
    setSearchOptions(newOptions);
    
    if (inputValue.trim()) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        onChange(inputValue, newOptions);
      }, debounceTime);
    }
  };

  const toggleOptions = () => {
    setIsOptionsOpen(!isOptionsOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex mb-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FeatherIcon icon="search" className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
          />
          {inputValue && (
            <button 
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              onClick={handleClear}
              aria-label="Clear search"
              type="button"
            >
              <FeatherIcon icon="x" className="h-5 w-5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={toggleOptions}
          className="ml-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
          aria-label="Search options"
        >
          <FeatherIcon icon="sliders" className="h-5 w-5" />
        </button>
      </div>

      {isOptionsOpen && (
        <div 
          ref={optionsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-4"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Mode</label>
            <div className="flex space-x-2">
              <button
                type="button"
                className={`px-3 py-1 text-sm rounded-md ${searchOptions.mode === 'semantic' ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleOptionChange({ mode: 'semantic' })}
              >
                Semantic
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-sm rounded-md ${searchOptions.mode === 'exact' ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleOptionChange({ mode: 'exact' })}
              >
                Exact Match
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-sm rounded-md ${searchOptions.mode === 'hybrid' ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => handleOptionChange({ mode: 'hybrid' })}
              >
                Hybrid
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relevance Threshold: {searchOptions.threshold}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={searchOptions.threshold}
              onChange={(e) => handleOptionChange({ threshold: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Broader results</span>
              <span>Exact matches</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOptionsOpen(false)}
              className="text-sm"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {searchOptions.mode !== 'exact' && (
        <div className="mt-1 text-xs text-gray-500 flex items-center">
          <FeatherIcon icon="info" className="h-3 w-3 mr-1 text-blue-500" />
          <span>
            {searchOptions.mode === 'semantic' 
              ? 'Semantic search enabled: finds results based on meaning, not just exact words.' 
              : 'Hybrid search: combines semantic understanding with exact matching.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default SemanticSearchInput; 