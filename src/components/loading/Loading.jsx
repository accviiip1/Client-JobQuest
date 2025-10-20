import React, { useState, useEffect } from 'react';
import './Loading.scss';

const Loading = ({ size = 'medium', text = 'Đang tải...', className = '', showProgress = false, progress = 0 }) => {
  const [dots, setDots] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`loading-container ${className} ${fadeIn ? 'fade-in' : ''}`}>
      <div className="loading-content">
        <div className={`loading-spinner ${size}`}>
          <div className="spinner">
            <div className="spinner-inner"></div>
            <div className="spinner-outer"></div>
          </div>
        </div>
        
        {text && (
          <div className="loading-text">
            {text}
            <span className="loading-dots">{dots}</span>
          </div>
        )}
        
        {showProgress && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
