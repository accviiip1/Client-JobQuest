import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/authContext.js";
import { useSocket } from "../context/socketContext.js";
import messageService from "../services/messageService.js";

const useUnreadMessages = () => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
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

  // Lấy tổng số tin nhắn chưa đọc
  const fetchTotalUnreadCount = useCallback(async () => {
    if (!userType || !userId) {
      setTotalUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await messageService.getUnreadCount(userType, userId);
      const newCount = response.data.unreadCount || 0;
      setTotalUnreadCount(newCount);
    } catch (error) {
      console.error("Lỗi lấy tổng số tin nhắn chưa đọc:", error);
      setTotalUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [userType, userId]);

  // Debounced fetch để tránh gọi API quá nhiều
  const debouncedFetch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchTotalUnreadCount();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchTotalUnreadCount]);

  // Load tổng số tin nhắn chưa đọc khi user thay đổi
  useEffect(() => {
    fetchTotalUnreadCount();
  }, [fetchTotalUnreadCount]);

  // Cập nhật mỗi 30 giây
  useEffect(() => {
    if (!userType || !userId) return;

    const interval = setInterval(() => {
      fetchTotalUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [userType, userId, fetchTotalUnreadCount]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !userType || !userId) return;

    // Lắng nghe tin nhắn mới - chỉ tăng count nếu tin nhắn được gửi cho user hiện tại
    const handleNewMessage = (messageData) => {
      if (messageData.receiverType === userType && messageData.receiverId === userId) {
        // Kiểm tra xem tin nhắn này đã được xử lý chưa để tránh cộng dồn
        setTotalUnreadCount(prev => {
          // Nếu count hiện tại quá lớn so với thực tế, refresh từ server
          if (prev > 50) {
            setTimeout(() => fetchTotalUnreadCount(), 1000);
            return prev;
          }
          return prev + 1;
        });
      }
    };

    // Lắng nghe khi conversation được cập nhật - refresh count
    const handleConversationUpdate = (data) => {
      // Chỉ refresh nếu update liên quan đến user hiện tại
      if (data.userType === userType && data.userId === userId) {
        debouncedFetch();
      }
    };

    // Lắng nghe khi tin nhắn được đánh dấu đã đọc - refresh count
    const handleMarkAsRead = (data) => {
      // Chỉ refresh nếu mark as read liên quan đến user hiện tại
      if (data.userType === userType && data.userId === userId) {
        debouncedFetch();
      }
    };

    on('message_received', handleNewMessage);
    on('conversation_updated', handleConversationUpdate);
    on('mark_as_read', handleMarkAsRead);

    return () => {
      off('message_received', handleNewMessage);
      off('conversation_updated', handleConversationUpdate);
      off('mark_as_read', handleMarkAsRead);
    };
  }, [socket, isConnected, userType, userId, on, off, fetchTotalUnreadCount]);

  return {
    totalUnreadCount,
    loading,
    refetch: fetchTotalUnreadCount,
    refetchUnreadCount: fetchTotalUnreadCount,
    decrementCount: () => setTotalUnreadCount(prev => Math.max(0, prev - 1)),
    resetCount: () => setTotalUnreadCount(0)
  };
};

export default useUnreadMessages;
