import React, { useState, useEffect } from 'react';
import './LoadingScreen.scss';

const LoadingScreen = ({ 
  text = 'Đang tải...', 
  progress = 0, 
  showProgress = false,
  onComplete = null 
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (showProgress && progress > 0) {
      const timer = setInterval(() => {
        setCurrentProgress(prev => {
          if (prev >= progress) {
            clearInterval(timer);
            if (progress >= 100) {
              setTimeout(() => {
                setIsComplete(true);
                if (onComplete) onComplete();
              }, 500);
            }
            return progress;
          }
          return prev + 1;
        });
      }, 30);
      
      return () => clearInterval(timer);
    }
  }, [progress, showProgress, onComplete]);

  if (isComplete) {
    return null;
  }

  return (
    <div className="loading-screen">
      <div className="loading-screen-content">
        {/* Background particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
        
        {/* Main spinner */}
        <div className="main-spinner">
          <div className="spinner-core">
            <div className="spinner-inner"></div>
            <div className="spinner-middle"></div>
            <div className="spinner-outer"></div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="loading-text-container">
          <h2 className="loading-title">{text}</h2>
          <div className="loading-subtitle">
            <span className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        {showProgress && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${currentProgress}%` }}
              ></div>
              <div className="progress-shine"></div>
            </div>
            <div className="progress-text">{currentProgress}%</div>
          </div>
        )}
        
        {/* Loading steps */}
        <div className="loading-steps">
          <div className="step active">
            <div className="step-icon">✓</div>
            <span>Khởi tạo</span>
          </div>
          <div className="step">
            <div className="step-icon">⏳</div>
            <span>Tải dữ liệu</span>
          </div>
          <div className="step">
            <div className="step-icon">⏳</div>
            <span>Hoàn thành</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
