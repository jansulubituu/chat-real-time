import React from 'react';

interface OnlineIndicatorProps {
  status: 'online' | 'offline';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  status,
  className = '',
  size = 'md',
  showLabel = false
}) => {
  const baseClasses = 'flex items-center';
  
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };
  
  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400'
  };
  
  const labelClasses = {
    online: 'text-green-500',
    offline: 'text-gray-500'
  };
  
  const pulseAnimation = status === 'online' ? 'animate-pulse' : '';
  
  return (
    <div className={`${baseClasses} ${className}`}>
      <div className={`rounded-full ${sizeClasses[size]} ${statusClasses[status]} ${pulseAnimation}`}></div>
      {showLabel && (
        <span className={`ml-2 text-xs font-medium ${labelClasses[status]}`}>
          {status === 'online' ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
};
