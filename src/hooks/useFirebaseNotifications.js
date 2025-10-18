import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/authContext';
import { makeRequest } from '../axios.js';

export const useFirebaseNotifications = () => {
  const { currentUser, currentCompany } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef(null);

  // Xác định user ID và type
  const getUserId = useCallback(() => {
    if (currentUser) return currentUser.id?.toString() || currentUser.user_id?.toString();
    if (currentCompany) return currentCompany.id?.toString() || currentCompany.company_id?.toString();
    return null;
  }, [currentUser, currentCompany]);

  const getType = useCallback(() => {
    if (currentUser) return 'user';
    if (currentCompany) return 'company';
    return 'user';
  }, [currentUser, currentCompany]);

  // Load số lượng thông báo
  const loadNotificationCount = useCallback(async () => {
    const userId = getUserId();
    const type = getType();
    
    if (!userId) return;

    try {
      const res = await makeRequest.get(`/notification/unread-count?userType=${type}&userId=${userId}`);
      const newCount = res.data.data?.unreadCount || 0;
      setNotificationCount(newCount);
      setLastCount(newCount);
    } catch (error) {
      console.error("Lỗi khi load số thông báo:", error);
    }
  }, [getUserId, getType]);

  // Refresh notification count (gọi thủ công khi cần)
  const refreshNotificationCount = useCallback(async () => {
    const userId = getUserId();
    const type = getType();
    
    if (!userId) return;

    try {
      const res = await makeRequest.get(`/notification/unread-count?userType=${type}&userId=${userId}`);
      const newCount = res.data.data?.unreadCount || 0;
      
      // Nếu có thông báo mới (số lượng tăng)
      if (newCount > lastCount && lastCount > 0) {
        setNotificationCount(newCount);
        setIsVisible(true);
        
        // Tự động ẩn sau 10 giây
        setTimeout(() => {
          setIsVisible(false);
        }, 10000);
      } else {
        setNotificationCount(newCount);
      }
      
      setLastCount(newCount);
    } catch (error) {
      console.error("Lỗi khi refresh số thông báo:", error);
    }
  }, [getUserId, getType, lastCount]);

  // Load thông báo ban đầu khi component mount hoặc user thay đổi
  useEffect(() => {
    loadNotificationCount();
  }, [currentUser, currentCompany, loadNotificationCount]);

  // Real-time updates cho notification count
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    // Cập nhật notification count mỗi 5 giây
    intervalRef.current = setInterval(() => {
      refreshNotificationCount();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentUser, currentCompany, getUserId, refreshNotificationCount]);

  // Ẩn popup
  const hidePopup = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Hiển thị popup thủ công (cho testing)
  const showPopup = useCallback(() => {
    setIsVisible(true);
  }, []);

  return {
    notificationCount,
    isVisible,
    hidePopup,
    showPopup,
    refreshNotificationCount
  };
};
