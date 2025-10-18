import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/authContext.js";
import { useSocket } from "../../context/socketContext.js";
import messageService from "../../services/messageService.js";
import userService from "../../services/userService.js";
import { getPlaceholderAvatar, getAvatarFromDetails } from "../../utils/avatarUtils.js";
import ChatBox from "./ChatBox.jsx";
import ConversationDetails from "./ConversationDetails.jsx";
import "./conversationsList.scss";

const ConversationsList = () => {
  const { currentUser, currentCompany } = useAuth();
  const { isConnected, emit, on, off } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [conversationDetails, setConversationDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const intervalRef = useRef(null);

  // Xác định loại user hiện tại và ID
  const user = currentUser || currentCompany;
  const userType = currentUser ? "user" : currentCompany ? "company" : "user";
  const userId = user?.id?.toString() || 
                 user?.user_id?.toString() || 
                 user?.company_id?.toString() ||
                 user?.userId?.toString() ||
                 user?.companyId?.toString();

  // Lấy thông tin chi tiết của user/company
  const fetchUserDetails = useCallback(async (type, id) => {
    try {
      const details = await userService.getUserInfo(type, id);
      return details;
    } catch (error) {
      console.error("❌ Lỗi lấy thông tin user/company:", error);
      return null;
    }
  }, []);

  // Lấy danh sách cuộc trò chuyện
  const fetchConversations = useCallback(async () => {
    if (!userType || !userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.getConversations(userType, userId);
      const conversationsData = response.data || [];
      setConversations(conversationsData);

      // Lấy thông tin chi tiết cho từng conversation
      const detailsPromises = conversationsData.map(async (conv) => {
        const details = await fetchUserDetails(conv.otherType, conv.otherId);
        return { key: `${conv.otherType}_${conv.otherId}`, details };
      });

      const detailsResults = await Promise.all(detailsPromises);
      const detailsMap = {};
      detailsResults.forEach(({ key, details }) => {
        detailsMap[key] = details;
      });
      setConversationDetails(detailsMap);
    } catch (err) {
      setError(err.message || "Lỗi khi tải cuộc trò chuyện");
    } finally {
      setLoading(false);
    }
  }, [userType, userId, fetchUserDetails]);

  // Load conversations khi component mount hoặc user thay đổi
  useEffect(() => {
    if (!userType || !userId) return;
    fetchConversations();
  }, [userType, userId, fetchConversations]);

  // WebSocket real-time updates cho conversations
  useEffect(() => {
    if (!userType || !userId || !isConnected) return;

    // Join room cho user hiện tại
    const roomName = `${userType}_${userId}`;
    emit("join_room", roomName);

    // Listen cho tin nhắn mới
    const handleNewMessage = (message) => {
      // Refresh conversations khi có tin nhắn mới
      fetchConversations();
    };

    // Listen cho conversation updates
    const handleConversationUpdate = () => {
      fetchConversations();
    };

    on("message_received", handleNewMessage);
    on("conversation_updated", handleConversationUpdate);

    // Fallback: Cập nhật conversations mỗi 30 giây nếu WebSocket không hoạt động
    intervalRef.current = setInterval(() => {
      fetchConversations();
    }, 30000);

    return () => {
      off("message_received", handleNewMessage);
      off("conversation_updated", handleConversationUpdate);
      emit("leave_room", roomName);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userType, userId, isConnected, fetchConversations, emit, on, off]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
  };

  const handleShowDetails = (conversation, event) => {
    event.stopPropagation();
    setSelectedConversation(conversation);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  // Refresh conversations khi có tin nhắn mới
  const handleSendMessage = () => {
    // Refresh conversations sau khi gửi tin nhắn với delay ngắn hơn
    setTimeout(() => {
      fetchConversations();
    }, 200);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      if (isNaN(date.getTime())) {
        return "";
      }
      
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        });
      } else if (diffInHours < 48) {
        return "Hôm qua";
      } else {
        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit"
        });
      }
    } catch (error) {
      return "";
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (!user) {
    return (
      <div className="conversations-list">
        <div className="conversations-list__empty">
          <i className="fas fa-user-lock"></i>
          <p>Vui lòng đăng nhập để xem cuộc trò chuyện</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversations-list">
      <div className="conversations-list__header">
        <h3>Cuộc trò chuyện</h3>
        <button 
          className="conversations-list__refresh-btn"
          onClick={fetchConversations}
          disabled={loading}
        >
          <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
        </button>
      </div>

      {loading && (
        <div className="conversations-list__loading">
          <div className="spinner"></div>
          <span>Đang tải cuộc trò chuyện...</span>
        </div>
      )}

      {error && (
        <div className="conversations-list__error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {conversations.length === 0 && !loading && (
        <div className="conversations-list__empty">
          <i className="fas fa-comments"></i>
          <p>Chưa có cuộc trò chuyện nào</p>
          <span>Bắt đầu nhắn tin với người khác để tạo cuộc trò chuyện</span>
        </div>
      )}

      <div className="conversations-list__items">
                 {conversations.map((conversation) => {
           const details = conversationDetails[`${conversation.otherType}_${conversation.otherId}`];
          
          const displayName = details?.name || 
                             details?.fullName || 
                             details?.nameCompany || 
                             `${conversation.otherType === "user" ? "Người dùng" : "Công ty"} #${conversation.otherId}`;
                     // Xử lý avatar URL
           const avatarUrl = getAvatarFromDetails(details, conversation.otherType);
           const avatar = avatarUrl || getPlaceholderAvatar(displayName);
          const status = details?.status || "offline";
          
          return (
            <div
              key={`${conversation.otherType}_${conversation.otherId}`}
              className={`conversations-list__item ${
                selectedConversation?.otherId === conversation.otherId ? "active" : ""
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="conversations-list__item__avatar">
                                 <img 
                   src={avatar} 
                   alt={displayName}
                   onError={(e) => {
                     e.target.src = getPlaceholderAvatar(displayName);
                   }}
                 />
                <div className={`conversations-list__item__status ${status}`}></div>
                {conversation.unreadCount > 0 && (
                  <>
                    <span className="conversations-list__item__badge">
                      {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                    </span>
                    <div className="conversations-list__item__unread-dot"></div>
                  </>
                )}
              </div>
              
              <div className="conversations-list__item__content">
                <div className="conversations-list__item__header">
                  <h4>{displayName}</h4>
                  <div className="conversations-list__item__actions">
                    <span className="conversations-list__item__time">
                      {formatTime(conversation.lastTimestamp)}
                    </span>
                    <button 
                      className="conversations-list__item__details-btn"
                      onClick={(e) => handleShowDetails(conversation, e)}
                      title="Xem chi tiết"
                    >
                      <i className="fas fa-info-circle"></i>
                    </button>
                  </div>
                </div>
                
                <div className="conversations-list__item__message">
                  <p className={conversation.unreadCount > 0 ? "unread" : ""}>
                    {conversation.unreadCount > 0 ? (
                      <strong>{truncateText(conversation.lastMessage)}</strong>
                    ) : (
                      truncateText(conversation.lastMessage)
                    )}
                  </p>
                </div>
                
                {details && (
                  <div className="conversations-list__item__details">
                    {details.email && (
                      <span className="conversations-list__item__email">
                        <i className="fas fa-envelope"></i>
                        {details.email}
                      </span>
                    )}
                    {details.phone && (
                      <span className="conversations-list__item__phone">
                        <i className="fas fa-phone"></i>
                        {details.phone}
                      </span>
                    )}
                    {details.location && (
                      <span className="conversations-list__item__location">
                        <i className="fas fa-map-marker-alt"></i>
                        {details.location}
                      </span>
                    )}
                    {!details.email && !details.phone && !details.location && (
                      <span className="conversations-list__item__no-details">
                        <i className="fas fa-info-circle"></i>
                        Thông tin cơ bản
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedConversation && (
        <ChatBox
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          otherUser={{
            id: selectedConversation.otherId,
            name: conversationDetails[`${selectedConversation.otherType}_${selectedConversation.otherId}`]?.name || 
                   conversationDetails[`${selectedConversation.otherType}_${selectedConversation.otherId}`]?.fullName || 
                   conversationDetails[`${selectedConversation.otherType}_${selectedConversation.otherId}`]?.nameCompany || 
                   `${selectedConversation.otherType === "user" ? "Người dùng" : "Công ty"} #${selectedConversation.otherId}`,
                         avatar: (() => {
               const details = conversationDetails[`${selectedConversation.otherType}_${selectedConversation.otherId}`];
               const name = details?.name || details?.fullName || details?.nameCompany || `User ${selectedConversation.otherId}`;
               const avatarUrl = getAvatarFromDetails(details, selectedConversation.otherType);
               return avatarUrl || getPlaceholderAvatar(name);
             })()
          }}
          otherType={selectedConversation.otherType}
          otherId={selectedConversation.otherId}
          onSendMessage={handleSendMessage}
        />
      )}

      {showDetails && selectedConversation && (
        <ConversationDetails
          conversation={selectedConversation}
          details={conversationDetails[`${selectedConversation.otherType}_${selectedConversation.otherId}`]}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default ConversationsList;

