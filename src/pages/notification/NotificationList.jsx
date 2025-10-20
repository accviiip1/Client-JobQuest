import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../context/authContext";
import { useSocket } from "../../context/socketContext.js";
import { makeRequest } from "../../axios.js";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../components/loading/Loading";
import "./notification.scss";

export default function NotificationList() {
  const { currentUser, currentCompany } = useAuth();
  const { socket, isConnected, on, off } = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(new Set());
  const [newNotificationIds, setNewNotificationIds] = useState(new Set());
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const intervalRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      if (currentUser) {
        const userId = currentUser.id?.toString() || currentUser.user_id?.toString();
        const res = await makeRequest.get(`/notification/list?userType=user&userId=${userId}&limit=50`);
        setNotifications(res.data?.data?.notifications || []);
      } else if (currentCompany) {
        const companyId = currentCompany.id?.toString() || currentCompany.company_id?.toString();
        const res = await makeRequest.get(`/notification/list?userType=company&userId=${companyId}&limit=50`);
        setNotifications(res.data?.data?.notifications || []);
      }
    } catch (error) {
      console.error("❌ Lỗi khi load thông báo:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentCompany]);

  useEffect(() => {
    if (currentUser || currentCompany) {
      loadNotifications();
    }
  }, [currentUser, currentCompany, loadNotifications]);

  // WebSocket real-time updates cho notifications
  useEffect(() => {
    if (!socket || !isConnected || (!currentUser && !currentCompany)) return;

    // Xác định user type và ID
    const userType = currentUser ? "user" : "company";
    const userId = currentUser?.id?.toString() || currentUser?.user_id?.toString() || 
                   currentCompany?.id?.toString() || currentCompany?.company_id?.toString();

    if (!userId) return;

    // Join room
    socket.emit("join", { userType, userId });

    // Lắng nghe thông báo mới
    const handleNewNotification = (notification) => {
      console.log("🔔 Nhận thông báo mới:", notification);
      
      // Thêm vào đầu danh sách
      setNotifications(prev => [notification, ...prev]);
      
      // Đánh dấu là thông báo mới
      setNewNotificationIds(prev => new Set(prev).add(notification.id));
      
      // Tự động xóa đánh dấu sau 3 giây
      setTimeout(() => {
        setNewNotificationIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notification.id);
          return newSet;
        });
      }, 3000);
    };

    // Lắng nghe khi thông báo được đánh dấu đã đọc
    const handleNotificationRead = (data) => {
      console.log("📖 Thông báo đã đọc:", data);
      // Có thể cập nhật UI nếu cần
    };

    on('notification_received', handleNewNotification);
    on('notification_read', handleNotificationRead);

    return () => {
      off('notification_received', handleNewNotification);
      off('notification_read', handleNotificationRead);
    };
  }, [socket, isConnected, currentUser, currentCompany, on, off]);

  // Fallback polling mỗi 30 giây (chỉ khi không có WebSocket)
  useEffect(() => {
    if (!socket || !isConnected || (!currentUser && !currentCompany)) return;

    intervalRef.current = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [socket, isConnected, currentUser, currentCompany, loadNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(prev => new Set(prev).add(notificationId));
      
      await makeRequest.put(`/notification/mark-read/${notificationId}`);
      
      // Cập nhật trạng thái local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, isRead: true }
            : notif
        )
      );

      // Emit WebSocket event để thông báo cho các client khác
      if (socket && isConnected) {
        const userType = currentUser ? "user" : "company";
        const userId = currentUser?.id?.toString() || currentUser?.user_id?.toString() || 
                       currentCompany?.id?.toString() || currentCompany?.company_id?.toString();
        
        socket.emit("notification_read", {
          userType,
          userId,
          notificationId
        });
      }
    } catch (error) {
      console.error("❌ Lỗi khi đánh dấu đã đọc:", error);
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const getNotificationLink = (notification) => {
    // Xử lý thông báo follow công ty
    if (notification.message && notification.message.includes("theo dõi công ty")) {
      // Nếu là company nhận thông báo follow từ user
      if (currentCompany && notification.sender_type === "user") {
        return `/nguoi-dung/${notification.sender_id}`;
      }
      // Nếu là user nhận thông báo follow từ company
      if (currentUser && notification.sender_type === "company") {
        return `/cong-ty/${notification.sender_id}`;
      }
    }
    
    // Xử lý thông báo follow công việc
    if (notification.message && notification.message.includes("theo dõi công việc")) {
      // Nếu là company nhận thông báo follow job từ user
      if (currentCompany && notification.sender_type === "user") {
        return `/nguoi-dung/${notification.sender_id}`;
      }
      // Nếu là user nhận thông báo follow job từ company
      if (currentUser && notification.sender_type === "company") {
        return `/cong-ty/${notification.sender_id}`;
      }
    }
    
    // Xử lý thông báo apply job
    if (notification.message && notification.message.includes("ứng tuyển")) {
      // Nếu là company, link đến trang ứng viên
      if (currentCompany) {
        return "/nha-tuyen-dung/ung-vien";
      }
      // Nếu là user, link đến trang apply của user đó
      if (currentUser) {
        return `/nguoi-dung/${currentUser.id}/apply`;
      }
    }
    
    // Xử lý thông báo status update
    if (notification.message && notification.message.includes("trạng thái")) {
      // Nếu là user, link đến trang apply của user đó
      if (currentUser) {
        return `/nguoi-dung/${currentUser.id}/apply`;
      }
    }
    
    // Default fallback
    if (currentCompany) {
      return "/nha-tuyen-dung/ung-vien";
    }
    
    if (currentUser) {
      return `/nguoi-dung/${currentUser.id}/apply`;
    }
    
    return "/";
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Đánh dấu đã đọc nếu chưa đọc
      if (!notification.is_read && !notification.isRead) {
        await handleMarkAsRead(notification.id);
      }
      
      // Chuyển hướng đến trang tương ứng
      const link = getNotificationLink(notification);
      navigate(link);
    } catch (error) {
      console.error("Lỗi khi xử lý click thông báo:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);
      
      // Đánh dấu tất cả thông báo chưa đọc thành đã đọc
      const unreadNotifications = notifications.filter(n => !n.is_read && !n.isRead);
      
      for (const notification of unreadNotifications) {
        await makeRequest.put(`/notification/mark-read/${notification.id}`);
      }
      
      // Cập nhật trạng thái local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true, isRead: true }))
      );
      
      // Emit event để Header cập nhật số thông báo
      window.dispatchEvent(new CustomEvent('notificationUpdated'));
      
      console.log('✅ Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error("❌ Lỗi khi đánh dấu tất cả thông báo:", error);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const formatDate = (dateInput) => {
    try {
      // Debug: Log timestamp để kiểm tra
      console.log('🔍 formatDate input:', dateInput, 'type:', typeof dateInput);
      
      // Kiểm tra nếu dateInput không tồn tại hoặc null
      if (!dateInput) {
        return "Vừa xong";
      }

      let date;
      
      // Nếu đã là Date object
      if (dateInput instanceof Date) {
        date = dateInput;
      }
      // Nếu là timestamp (số)
      else if (typeof dateInput === 'number') {
        date = new Date(dateInput);
      } 
      // Nếu là string timestamp
      else if (typeof dateInput === 'string' && /^\d+$/.test(dateInput)) {
        date = new Date(parseInt(dateInput));
      }
      // Nếu là string date thông thường (MySQL format)
      else if (typeof dateInput === 'string') {
        // Xử lý format MySQL datetime: YYYY-MM-DD HH:mm:ss
        if (dateInput.includes('-') && dateInput.includes(':')) {
          date = new Date(dateInput);
        } else {
          date = new Date(dateInput);
        }
      }
      // Nếu là object có toDate method (Firestore Timestamp)
      else if (dateInput && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      }
      // Nếu là object có seconds (Firestore Timestamp object)
      else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
        date = new Date(dateInput.seconds * 1000);
      }
      else {
        console.warn('Unknown date format:', dateInput);
        return "Vừa xong";
      }

      // Kiểm tra nếu date không hợp lệ
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after parsing:', dateInput);
        return "Vừa xong";
      }

      const now = new Date();
      const diffInMs = now - date;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInMinutes < 1) {
        return "Vừa xong";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
      } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
      } else if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        return `${weeks} tuần trước`;
      } else if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        return `${months} tháng trước`;
      } else {
        return date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'dateInput:', dateInput);
      return "Vừa xong";
    }
  };

  if (loading) {
    return (
      <div className="notification-page">
        <div className="container">
          <div className="notification-page__wrapper">
            <div className="notification-page__header">
              <div className="notification-page__header-left">
                <Link to="/">
                  <button className="btn-back">
                    <i className="fa-solid fa-angle-left"></i>
                    <span>Quay lại</span>
                  </button>
                </Link>
                <h2>Thông báo</h2>
              </div>
            </div>
            <div className="notification-page__body">
              <Loading text="Đang tải thông báo..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-page">
      <div className="container">
        <div className="notification-page__wrapper">
          <div className="notification-page__header">
            <div className="notification-page__header-left">
              <Link to="/">
                <button className="btn-back">
                  <i className="fa-solid fa-angle-left"></i>
                  <span>Quay lại</span>
                </button>
              </Link>
              <h2>Thông báo</h2>
              <div style={{ 
                fontSize: "12px", 
                color: isConnected ? "#28a745" : "#dc3545",
                marginLeft: "10px",
                display: "flex",
                alignItems: "center"
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isConnected ? "#28a745" : "#dc3545",
                  marginRight: "5px"
                }}></div>
                {isConnected ? "Real-time" : "Offline"}
              </div>
            </div>
            
            <div className="notification-page__header-right">
              {notifications.some(notif => !notif.is_read && !notif.isRead) && (
                <button 
                  className="btn-mark-all-read"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAllAsRead}
                >
                  {markingAllAsRead ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check-double"></i>
                      <span>Đã xem tất cả</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="notification-page__body">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <i className="fa-regular fa-bell"></i>
                <p>Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                                     <div 
                     key={notification.id} 
                     className={`notification-item 
                       ${(!notification.is_read && !notification.isRead) ? 'unread' : ''} 
                       ${markingAsRead.has(notification.id) ? 'marking' : ''}
                       ${newNotificationIds.has(notification.id) ? 'new-notification' : ''}
                     `}
                    onClick={() => {
                      if (!markingAsRead.has(notification.id)) {
                        handleNotificationClick(notification);
                      }
                    }}
                    style={{ 
                      cursor: markingAsRead.has(notification.id) ? 'default' : 'pointer',
                      opacity: markingAsRead.has(notification.id) ? 0.7 : 1
                    }}
                  >
                    <div className="notification-content">
                      <div 
                        className="notification-message"
                        dangerouslySetInnerHTML={{ __html: notification.message }}
                      />
                      <div className="notification-time">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

