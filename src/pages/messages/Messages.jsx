import React from "react";
import { useAuth } from "../../context/authContext.js";
import ConversationsList from "../../components/chat/ConversationsList.jsx";

import "./messages.scss";

const Messages = () => {
  const { currentUser, currentCompany } = useAuth();
  const user = currentUser || currentCompany;

  console.log("🔍 Messages - Auth Debug:", {
    currentUser,
    currentCompany,
    user,
    hasUser: !!user
  });

  if (!user) {
    return (
      <div className="messages-page">
        <div className="container">
          <div className="messages-page__auth-required">
            <i className="fas fa-user-lock"></i>
            <h2>Vui lòng đăng nhập</h2>
            <p>Bạn cần đăng nhập để xem tin nhắn</p>
            <div className="messages-page__debug-info">
              <p><strong>Debug Info:</strong></p>
              <p>currentUser: {currentUser ? "Có" : "Không"}</p>
              <p>currentCompany: {currentCompany ? "Có" : "Không"}</p>
              <p>localStorage user: {localStorage.getItem("user") ? "Có" : "Không"}</p>
              <p>localStorage company: {localStorage.getItem("company") ? "Có" : "Không"}</p>
            </div>
            <button 
              onClick={() => window.location.href = "/login"}
              className="messages-page__login-btn"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="container">
        <div className="messages-page__header">
          <h1>Tin nhắn</h1>
          <p>Quản lý cuộc trò chuyện của bạn</p>
        </div>
        
        <div className="messages-page__content">
          <ConversationsList />
        </div>
      </div>
    </div>
  );
};

export default Messages;

