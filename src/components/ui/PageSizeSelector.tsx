import React from 'react';

interface PageSizeSelectorProps {
  options: number[];
  value: number;
  onChange: (size: number) => void;
  disabled?: boolean;
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  options,
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="pageSize" className="text-sm text-gray-600">
        Rows per page:
      </label>
      <select
        id="pageSize"
        className="bg-white border border-gray-300 rounded-md text-gray-700 py-1 pl-2 pr-8 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PageSizeSelector; 