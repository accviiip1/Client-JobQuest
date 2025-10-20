import React from 'react';
import './SkeletonLoader.scss';

const SkeletonLoader = ({ 
  type = 'text', 
  lines = 3, 
  width = '100%', 
  height = '20px',
  className = '',
  animated = true 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="skeleton-text">
            {Array.from({ length: lines }).map((_, index) => (
              <div 
                key={index}
                className={`skeleton-line ${animated ? 'animated' : ''}`}
                style={{ 
                  width: index === lines - 1 ? '60%' : '100%',
                  height: height 
                }}
              />
            ))}
          </div>
        );
      
      case 'card':
        return (
          <div className="skeleton-card">
            <div className={`skeleton-image ${animated ? 'animated' : ''}`} />
            <div className="skeleton-content">
              <div className={`skeleton-line ${animated ? 'animated' : ''}`} style={{ height: '20px', width: '80%' }} />
              <div className={`skeleton-line ${animated ? 'animated' : ''}`} style={{ height: '16px', width: '60%' }} />
              <div className={`skeleton-line ${animated ? 'animated' : ''}`} style={{ height: '14px', width: '40%' }} />
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className="skeleton-table">
            {Array.from({ length: lines }).map((_, index) => (
              <div key={index} className="skeleton-row">
                <div className={`skeleton-cell ${animated ? 'animated' : ''}`} style={{ width: '30%' }} />
                <div className={`skeleton-cell ${animated ? 'animated' : ''}`} style={{ width: '40%' }} />
                <div className={`skeleton-cell ${animated ? 'animated' : ''}`} style={{ width: '20%' }} />
                <div className={`skeleton-cell ${animated ? 'animated' : ''}`} style={{ width: '10%' }} />
              </div>
            ))}
          </div>
        );
      
      case 'circle':
        return (
          <div 
            className={`skeleton-circle ${animated ? 'animated' : ''}`}
            style={{ width: height, height: height }}
          />
        );
      
      case 'custom':
        return (
          <div 
            className={`skeleton-custom ${animated ? 'animated' : ''}`}
            style={{ width, height }}
          />
        );
      
      default:
        return (
          <div 
            className={`skeleton-line ${animated ? 'animated' : ''}`}
            style={{ width, height }}
          />
        );
    }
  };

  return (
    <div className={`skeleton-loader ${className}`}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;
