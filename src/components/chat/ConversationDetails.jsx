import React from "react";
import "./conversationDetails.scss";

const ConversationDetails = ({ conversation, details, onClose }) => {
  if (!conversation || !details) return null;

  const displayName = details.name || 
                     details.fullName || 
                     details.nameCompany || 
                     `${conversation.otherType === "user" ? "Người dùng" : "Công ty"} #${conversation.otherId}`;
  
  const avatar = details.avatarPic || 
                details.avatar || 
                "/images/avatar.png";

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
      
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "";
    }
  };

  return (
    <>
      <div className="conversation-details-overlay" onClick={onClose}></div>
      <div className="conversation-details">
        <div className="conversation-details__header">
          <h3>Thông tin chi tiết</h3>
          <button className="conversation-details__close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="conversation-details__content">
          <div className="conversation-details__avatar">
            <img 
              src={avatar} 
              alt={displayName}
              onError={(e) => {
                e.target.src = "/images/avatar.png";
              }}
            />
          </div>

          <div className="conversation-details__info">
            <h4>{displayName}</h4>
            <p className="conversation-details__type">
              {conversation.otherType === "user" ? "Người dùng" : "Công ty"}
            </p>

            {details.email && (
              <div className="conversation-details__field">
                <i className="fas fa-envelope"></i>
                <span>{details.email}</span>
              </div>
            )}

            {details.phone && (
              <div className="conversation-details__field">
                <i className="fas fa-phone"></i>
                <span>{details.phone}</span>
              </div>
            )}

            {details.location && (
              <div className="conversation-details__field">
                <i className="fas fa-map-marker-alt"></i>
                <span>{details.location}</span>
              </div>
            )}

            {details.description && (
              <div className="conversation-details__field">
                <i className="fas fa-info-circle"></i>
                <span>{details.description}</span>
              </div>
            )}

            {details.website && (
              <div className="conversation-details__field">
                <i className="fas fa-globe"></i>
                <a href={details.website} target="_blank" rel="noopener noreferrer">
                  {details.website}
                </a>
              </div>
            )}

            <div className="conversation-details__stats">
              <div className="conversation-details__stat">
                <span className="conversation-details__stat-label">Tin nhắn cuối:</span>
                <span className="conversation-details__stat-value">
                  {formatTime(conversation.lastTimestamp)}
                </span>
              </div>
              
              {conversation.unreadCount > 0 && (
                <div className="conversation-details__stat">
                  <span className="conversation-details__stat-label">Chưa đọc:</span>
                  <span className="conversation-details__stat-value unread">
                    {conversation.unreadCount} tin nhắn
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationDetails;
