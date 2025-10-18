import React, { useState, useEffect } from 'react';
import './notification.scss';

const NotificationDialog = ({ 
  isOpen, 
  onClose, 
  title = "Thông báo", 
  message = "", 
  type = "info", // info, success, warning, error
  duration = 5000, // Tự động đóng sau bao nhiêu ms (0 = không tự đóng)
  showCloseButton = true,
  showIcon = true,
  onConfirm,
  onCancel,
  confirmText = "Đồng ý",
  cancelText = "Hủy",
  showActions = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Tự động đóng sau duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const handleConfirm = () => {
    onConfirm && onConfirm();
    handleClose();
  };

  const handleCancel = () => {
    onCancel && onCancel();
    handleClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fa-solid fa-circle-check';
      case 'warning':
        return 'fa-solid fa-triangle-exclamation';
      case 'error':
        return 'fa-solid fa-circle-xmark';
      case 'info':
      default:
        return 'fa-solid fa-circle-info';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`notification-dialog-overlay ${isAnimating ? 'active' : ''}`}>
      <div className={`notification-dialog ${getTypeClass()} ${isAnimating ? 'active' : ''}`}>
        {/* Header */}
        <div className="notification-dialog__header">
          <div className="notification-dialog__header-left">
            {showIcon && (
              <div className={`notification-dialog__icon ${getTypeClass()}`}>
                <i className={getIcon()}></i>
              </div>
            )}
            <h3 className="notification-dialog__title">{title}</h3>
          </div>
          
          {showCloseButton && (
            <button 
              className="notification-dialog__close-btn"
              onClick={handleClose}
              aria-label="Đóng thông báo"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="notification-dialog__content">
          <p className="notification-dialog__message">{message}</p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="notification-dialog__actions">
            <button 
              className="notification-dialog__btn notification-dialog__btn--cancel"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
            <button 
              className="notification-dialog__btn notification-dialog__btn--confirm"
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        )}

        {/* Progress bar cho auto-close */}
        {duration > 0 && (
          <div className="notification-dialog__progress">
            <div 
              className="notification-dialog__progress-bar"
              style={{ animationDuration: `${duration}ms` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Toast notification component (nhỏ gọn)
const ToastNotification = ({ 
  isOpen, 
  onClose, 
  message = "", 
  type = "info",
  duration = 3000,
  position = "top-right" // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fa-solid fa-check';
      case 'warning':
        return 'fa-solid fa-exclamation-triangle';
      case 'error':
        return 'fa-solid fa-times';
      case 'info':
      default:
        return 'fa-solid fa-info';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`toast-notification ${position} ${type} ${isAnimating ? 'active' : ''}`}>
      <div className="toast-notification__icon">
        <i className={getIcon()}></i>
      </div>
      <div className="toast-notification__content">
        <p className="toast-notification__message">{message}</p>
      </div>
      <button 
        className="toast-notification__close-btn"
        onClick={handleClose}
        aria-label="Đóng thông báo"
      >
        <i className="fa-solid fa-times"></i>
      </button>
      
      {duration > 0 && (
        <div className="toast-notification__progress">
          <div 
            className="toast-notification__progress-bar"
            style={{ animationDuration: `${duration}ms` }}
          ></div>
        </div>
      )}
    </div>
  );
};

// Hook để sử dụng notification dễ dàng
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (config) => {
    const id = Date.now() + Math.random();
    const notification = { id, ...config };
    setNotifications(prev => [...prev, notification]);
    
    return id;
  };

  const hideNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showDialog = (config) => {
    return showNotification({ ...config, type: 'dialog' });
  };

  const showToast = (config) => {
    return showNotification({ ...config, type: 'toast' });
  };

  const showSuccess = (message, config = {}) => {
    return showToast({ message, type: 'success', ...config });
  };

  const showError = (message, config = {}) => {
    return showToast({ message, type: 'error', ...config });
  };

  const showWarning = (message, config = {}) => {
    return showToast({ message, type: 'warning', ...config });
  };

  const showInfo = (message, config = {}) => {
    return showToast({ message, type: 'info', ...config });
  };

  return {
    notifications,
    showNotification,
    hideNotification,
    showDialog,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

// Notification container để render tất cả notifications
export const NotificationContainer = ({ notifications, onHide }) => {
  return (
    <>
      {notifications.map(notification => {
        if (notification.type === 'dialog') {
          return (
            <NotificationDialog
              key={notification.id}
              isOpen={true}
              onClose={() => onHide(notification.id)}
              {...notification}
            />
          );
        } else {
          return (
            <ToastNotification
              key={notification.id}
              isOpen={true}
              onClose={() => onHide(notification.id)}
              {...notification}
            />
          );
        }
      })}
    </>
  );
};

export default NotificationDialog;

