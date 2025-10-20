import React from 'react';
import './LoadingButton.scss';

const LoadingButton = ({ 
  children, 
  loading = false, 
  loadingText = 'Đang xử lý...',
  disabled = false,
  className = '',
  size = 'medium',
  variant = 'primary',
  onClick,
  ...props 
}) => {
  return (
    <button
      className={`loading-button ${className} ${size} ${variant} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      <span className="button-content">
        {loading && (
          <div className="button-spinner">
            <div className="spinner"></div>
          </div>
        )}
        <span className="button-text">
          {loading ? loadingText : children}
        </span>
      </span>
      
      {loading && (
        <div className="button-ripple">
          <div className="ripple"></div>
          <div className="ripple"></div>
          <div className="ripple"></div>
        </div>
      )}
    </button>
  );
};

export default LoadingButton;
