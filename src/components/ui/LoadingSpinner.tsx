import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  fullPage = false,
  text,
}) => {
  // Tailwind classes based on size
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center">
      <svg 
        className={`animate-spin text-blue-600 ${sizeClasses[size]}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinnerContent}
      </div>
    );
  }

  return <div className="flex justify-center py-4">{spinnerContent}</div>;
};

export default LoadingSpinner; 