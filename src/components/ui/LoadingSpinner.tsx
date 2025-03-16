import React from 'react';
import FeatherIcon from 'feather-icons-react';

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
      <div className={`animate-spin text-blue-600 ${sizeClasses[size]}`}>
        <FeatherIcon 
          icon="loader" 
          className="w-full h-full"
        />
      </div>
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