import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/authContext.js";
import { useSocket } from "../context/socketContext.js";
import notificationService from "../services/notificationService.js";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { currentUser, currentCompany } = useAuth();
  const { socket, isConnected, on, off } = useSocket();

  // Xác định loại user hiện tại và ID
  const user = currentUser || currentCompany;
  const userType = currentUser ? "user" : currentCompany ? "company" : null;
  const userId = user?.id?.toString() || 
                 user?.user_id?.toString() || 
                 user?.company_id?.toString() ||
                 user?.userId?.toString() ||
                 user?.companyId?.toString();

  // Lấy danh sách thông báo
  const fetchNotifications = useCallback(async (limit = 20, offset = 0) => {
    if (!userType || !userId) return;

    try {
      setLoading(true);
      const response = await notificationService.getNotifications(userType, userId, limit, offset);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách thông báo:", error);
    } finally {
      setLoading(false);
    }
  }, [userType, userId]);

  // Lấy số thông báo chưa đọc
  const fetchUnreadCount = useCallback(async () => {
    if (!userType || !userId) return;

    try {
      const response = await notificationService.getUnreadCount(userType, userId);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Lỗi lấy số thông báo chưa đọc:", error);
    }
  }, [userType, userId]);

  // Đánh dấu thông báo đã đọc
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Cập nhật local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      // Giảm unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  }, []);

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = useCallback(async () => {
    if (!userType || !userId) return;

    try {
      await notificationService.markAllAsRead(userType, userId);
      
      // Cập nhật local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", error);
    }
  }, [userType, userId]);

  // Xóa thông báo
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Cập nhật local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // Giảm unread count nếu thông báo chưa đọc
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
    }
  }, [notifications]);

  // Xóa tất cả thông báo
  const deleteAllNotifications = useCallback(async () => {
    if (!userType || !userId) return;

    try {
      await notificationService.deleteAllNotifications(userType, userId);
      
      // Reset local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi xóa tất cả thông báo:", error);
    }
  }, [userType, userId]);

  // Load thông báo ban đầu
  useEffect(() => {
    if (userType && userId) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !userType || !userId) return;

    // Lắng nghe thông báo mới
    const handleNewNotification = (notification) => {
      if (notification.receiver_type === userType && notification.receiver_id === userId) {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    // Lắng nghe khi thông báo được đánh dấu đã đọc
    const handleNotificationRead = (data) => {
      if (data.userType === userType && data.userId === userId) {
        fetchUnreadCount();
      }
    };

    on('notification_received', handleNewNotification);
    on('notification_read', handleNotificationRead);

    return () => {
      off('notification_received', handleNewNotification);
      off('notification_read', handleNotificationRead);
    };
  }, [socket, isConnected, userType, userId, on, off, fetchUnreadCount]);

  // Cập nhật mỗi 30 giây
  useEffect(() => {
    if (!userType || !userId) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [userType, userId, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};

export default useNotifications;




















