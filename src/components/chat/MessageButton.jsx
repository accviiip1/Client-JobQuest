import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/authContext.js";
import { useSocket } from "../../context/socketContext.js";
import messageService from "../../services/messageService.js";
import ChatBox from "./ChatBox.jsx";
import "./messageButton.scss";

const MessageButton = ({ otherUser, otherType, otherId, className = "" }) => {
  const { currentUser, currentCompany } = useAuth();
  const { socket, isConnected, on, off } = useSocket();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  // Xác định user hiện tại
  const user = currentUser || currentCompany;
  const userType = currentUser ? "user" : currentCompany ? "company" : null;
  const userId = user?.id?.toString() || 
                 user?.user_id?.toString() || 
                 user?.company_id?.toString() ||
                 user?.userId?.toString() ||
                 user?.companyId?.toString();



  // Lấy số tin nhắn chưa đọc cho conversation cụ thể
  const fetchUnreadCount = useCallback(async () => {
    if (!userType || !userId || !otherType || !otherId) return;
    
    try {
      // Lấy số tin nhắn chưa đọc cho conversation cụ thể
      const response = await messageService.getConversationUnreadCount(userType, userId, otherType, otherId);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Lỗi lấy số tin nhắn chưa đọc:", error);
    }
  }, [userType, userId, otherType, otherId]);

  // Load unread count khi component mount hoặc thay đổi conversation
  useEffect(() => {
    if (!userType || !userId || !otherType || !otherId) return;
    fetchUnreadCount();
  }, [userType, userId, otherType, otherId, fetchUnreadCount]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !userType || !userId || !otherType || !otherId) return;

    // Lắng nghe tin nhắn mới
    const handleNewMessage = (messageData) => {
      // Nếu tin nhắn được gửi cho user hiện tại từ other user, tăng unread count
      if (messageData.receiverType === userType && 
          messageData.receiverId === userId &&
          messageData.senderType === otherType &&
          messageData.senderId === otherId) {
        setUnreadCount(prev => prev + 1);
      }
    };

    // Lắng nghe mark as read
    const handleMarkAsRead = (data) => {
      // Nếu đánh dấu đã đọc cho conversation này, reset unread count
      if (data.userType === userType && 
          data.userId === userId &&
          data.otherType === otherType &&
          data.otherId === otherId) {
        setUnreadCount(0);
      }
    };

    on('message_received', handleNewMessage);
    on('mark_as_read', handleMarkAsRead);

    return () => {
      off('message_received', handleNewMessage);
      off('mark_as_read', handleMarkAsRead);
    };
  }, [socket, isConnected, userType, userId, otherType, otherId, on, off]);

  // Fallback: Cập nhật mỗi 10 giây nếu WebSocket không hoạt động
  useEffect(() => {
    if (!userType || !userId || !otherType || !otherId) return;

    intervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userType, userId, otherType, otherId, fetchUnreadCount]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    // Unread count sẽ được tự động cập nhật khi mở chat
    // thông qua API getMessages với markAsRead=true
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleSendMessage = (message) => {
    // Refresh unread count sau khi gửi tin nhắn
    setTimeout(() => {
      fetchUnreadCount();
    }, 500);
  };

  // Không hiển thị nút nếu chưa đăng nhập hoặc đang xem profile của chính mình
  if (!user || !userType || !userId) return null;
  
  // Không hiển thị nút nếu đang xem profile của chính mình
  if (userType === otherType && userId === otherId?.toString()) return null;

  return (
    <>
      <button
        className={`message-button ${className}`}
        onClick={handleOpenChat}
        title="Nhắn tin"
      >
        <i className="fas fa-comments"></i>
        {unreadCount > 0 && (
          <span className="message-button__badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <ChatBox
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        otherUser={otherUser}
        otherType={otherType}
        otherId={otherId?.toString()}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default MessageButton;
