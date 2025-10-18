import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext.js";
import useMessages from "../../hooks/useMessages.js";
import "./chatBox.scss";

const ChatBox = ({ 
  isOpen, 
  onClose, 
  otherUser, 
  otherType, 
  otherId,
  onSendMessage 
}) => {
  const { currentUser, currentCompany } = useAuth();
  const [messageText, setMessageText] = useState("");
  
  // Xác định loại user hiện tại và ID
  const user = currentUser || currentCompany;
  const userType = currentUser ? "user" : currentCompany ? "company" : "user";
  
  // Lấy ID từ user object - ưu tiên các trường có thể có
  const userId = user?.id?.toString() || 
                 user?.user_id?.toString() || 
                 user?.company_id?.toString() ||
                 user?.userId?.toString() ||
                 user?.companyId?.toString();



  const {
    messages,
    loading,
    error,
    sendMessage,
    unreadCount
  } = useMessages(userType, userId, otherType, otherId, isOpen);

  // Auto scroll to bottom (newest messages)
  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.chat-box__messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  // Scroll xuống cuối khi có tin nhắn mới hoặc mở chat
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);



  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendMessage(messageText);
      setMessageText("");
      if (onSendMessage) {
        onSendMessage(messageText);
      }
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      // Hiển thị thông báo lỗi cho người dùng
      alert(`Không thể gửi tin nhắn: ${error.message}`);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    try {
      // Xử lý timestamp từ Firebase (có thể là Firestore Timestamp hoặc Date)
      let date;
      if (timestamp.toDate) {
        // Nếu là Firestore Timestamp
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        // Nếu là timestamp object với seconds
        date = new Date(timestamp.seconds * 1000);
      } else {
        // Nếu là string hoặc number
        date = new Date(timestamp);
      }
      
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        return "";
      }
      
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      console.error("Lỗi format time:", error, timestamp);
      return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-box">
      <div className="chat-box__header">
        <div className="chat-box__user-info">
          <div className="chat-box__avatar">
            <img 
              src={otherUser?.avatar || "/images/avatar.png"} 
              alt={otherUser?.name || "User"}
            />
          </div>
          <div className="chat-box__user-details">
            <h4>{otherUser?.name || "Người dùng"}</h4>
            <span className="chat-box__status">Đang hoạt động</span>
          </div>
        </div>
        <button className="chat-box__close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="chat-box__messages">
        {loading && (
          <div className="chat-box__loading">
            <div className="spinner"></div>
            <span>Đang tải tin nhắn...</span>
          </div>
        )}

        {error && (
          <div className="chat-box__error">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="chat-box__empty">
            <i className="fas fa-comments"></i>
            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        )}

        {messages.map((message) => {
          // Xử lý cả snake_case và camelCase từ database
          const messageSenderId = message.sender_id || message.senderId;
          const messageSenderType = message.sender_type || message.senderType;
          const messageReceiverId = message.receiver_id || message.receiverId;
          const messageReceiverType = message.receiver_type || message.receiverType;
          
          const messageSenderIdStr = messageSenderId?.toString();
          const currentUserIdStr = userId?.toString();
          const isSentByMe = messageSenderIdStr === currentUserIdStr && 
                             messageSenderType === userType;
          


          return (
            <div
              key={message.id}
              className={`chat-box__message ${
                isSentByMe ? "chat-box__message--sent" : "chat-box__message--received"
              }`}
              data-debug={`sender:${messageSenderIdStr}_${messageSenderType}, current:${currentUserIdStr}_${userType}, isSent:${isSentByMe}`}
            >
              <div className="chat-box__message-content">
                <p>{message.text}</p>
                <span className="chat-box__message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <form className="chat-box__input-form" onSubmit={handleSendMessage}>
        <div className="chat-box__input-wrapper">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="chat-box__input"
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-box__send-btn"
            disabled={!messageText.trim() || loading}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
