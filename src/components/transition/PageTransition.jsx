import React, { useState, useEffect } from 'react';
import './PageTransition.scss';

const PageTransition = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`page-transition ${className}`}>
      {isLoading && (
        <div className="page-transition-overlay">
          <div className="transition-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>
      )}
      
      <div className={`page-content ${isVisible ? 'visible' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default PageTransition;
