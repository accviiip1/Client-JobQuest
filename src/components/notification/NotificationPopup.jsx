import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './notification.scss';

const NotificationPopup = ({ 
  isVisible, 
  onClose, 
  notificationCount = 0,
  onViewNotifications 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Tự động ẩn sau 10 giây
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  const handleViewNotifications = () => {
    onViewNotifications && onViewNotifications();
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`notification-popup ${isAnimating ? 'active' : ''}`}>
      <div className="notification-popup__content">
        {/* Icon thông báo */}
        <div className="notification-popup__icon">
          <i className="fa-solid fa-bell"></i>
          {notificationCount > 0 && (
            <span className="notification-popup__badge">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </div>

        {/* Nội dung thông báo */}
        <div className="notification-popup__message">
          <h4>Thông báo mới</h4>
          <p>Bạn có <strong>{notificationCount}</strong> thông báo mới</p>
        </div>

        {/* Nút xem ngay */}
        <button 
          className="notification-popup__view-btn"
          onClick={handleViewNotifications}
        >
          <i className="fa-solid fa-eye"></i>
          Xem ngay
        </button>

        {/* Nút đóng */}
        <button 
          className="notification-popup__close-btn"
          onClick={handleClose}
          aria-label="Đóng thông báo"
        >
          <i className="fa-solid fa-times"></i>
        </button>

        {/* Progress bar */}
                     <div className="notification-popup__progress">
               <div 
                 className="notification-popup__progress-bar"
                 style={{ animationDuration: '10s' }}
               ></div>
             </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
