import { useState, useEffect, useCallback, useRef } from "react";
import messageService from "../services/messageService.js";
import { useSocket } from "../context/socketContext.js";

const useMessages = (userType, userId, otherType, otherId, isOpen = false) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isInitialized = useRef(false);
  const { socket, isConnected, on, off } = useSocket();

  // Đảm bảo tất cả ID đều là string
  const normalizedUserId = userId?.toString();
  const normalizedOtherId = otherId?.toString();

  // Lấy tin nhắn
  const fetchMessages = useCallback(async () => {
    if (!userType || !normalizedUserId || !otherType || !normalizedOtherId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.getMessages(userType, normalizedUserId, otherType, normalizedOtherId);
      setMessages(response.data || []);
      
      // Cập nhật unread count từ response
      if (response.unreadCount !== undefined) {
        setUnreadCount(response.unreadCount);
      }
      

    } catch (err) {
      setError(err.message || "Lỗi khi tải tin nhắn");
    } finally {
      setLoading(false);
    }
  }, [userType, normalizedUserId, otherType, normalizedOtherId]);

  // Gửi tin nhắn
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    
    // Validation dữ liệu trước khi gửi
    if (!userType || !normalizedUserId || !otherType || !normalizedOtherId) {
      const error = new Error("Thiếu thông tin người dùng để gửi tin nhắn");
      setError(error.message);
      throw error;
    }
    
    try {
      const messageData = {
        senderType: userType,
        senderId: normalizedUserId,
        receiverType: otherType,
        receiverId: normalizedOtherId,
        text: text.trim()
      };
      

      
      const response = await messageService.sendMessage(messageData);
      
      // Thêm tin nhắn mới vào danh sách
      setMessages(prev => [...prev, response.data]);
      
      // Emit WebSocket event để thông báo tin nhắn mới
      if (socket && isConnected) {
        socket.emit('message_received', {
          ...response.data,
          receiverType: otherType,
          receiverId: normalizedOtherId
        });
        
        // Emit event để cập nhật conversation
        socket.emit('conversation_updated', {
          userType: otherType,
          userId: normalizedOtherId
        });
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Lỗi khi gửi tin nhắn";
      setError(errorMessage);
      throw err;
    }
  }, [userType, normalizedUserId, otherType, normalizedOtherId, socket, isConnected]);

  // Đánh dấu đã đọc
  const markAsRead = useCallback(async () => {
    try {
      // Chỉ gọi API nếu có đủ thông tin
      if (!userType || !normalizedUserId || !otherType || !normalizedOtherId) {
        return;
      }
      
      await messageService.markAsRead(userType, normalizedUserId, otherType, normalizedOtherId);
      setUnreadCount(0);
      
      // Emit WebSocket event để thông báo đã đánh dấu đọc
      if (socket && isConnected) {
        socket.emit('mark_as_read', {
          userType,
          userId: normalizedUserId,
          otherType,
          otherId: normalizedOtherId
        });
      }
    } catch (err) {
      console.error("Lỗi đánh dấu đọc:", err);
      // Không throw error để không làm crash app
    }
  }, [userType, normalizedUserId, otherType, normalizedOtherId, socket, isConnected]);

  // Lấy số tin nhắn chưa đọc
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await messageService.getUnreadCount(userType, normalizedUserId);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error("Lỗi lấy số tin nhắn chưa đọc:", err);
    }
  }, [userType, normalizedUserId]);

  // Load tin nhắn ban đầu khi component mount hoặc thay đổi conversation
  useEffect(() => {


    if (!userType || !normalizedUserId || !otherType || !normalizedOtherId) return;

    // Chỉ load tin nhắn khi có đủ thông tin và chưa được khởi tạo
    if (!isInitialized.current) {
      fetchMessages();
      fetchUnreadCount();
      isInitialized.current = true;
    }
  }, [userType, normalizedUserId, otherType, normalizedOtherId, fetchMessages, fetchUnreadCount]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Lắng nghe tin nhắn mới từ WebSocket
    const handleNewMessage = (messageData) => {
      // Chỉ thêm tin nhắn nếu nó thuộc về conversation hiện tại
      if ((messageData.senderType === userType && messageData.senderId === normalizedUserId && 
           messageData.receiverType === otherType && messageData.receiverId === normalizedOtherId) ||
          (messageData.senderType === otherType && messageData.senderId === normalizedOtherId && 
           messageData.receiverType === userType && messageData.receiverId === normalizedUserId)) {
        
        setMessages(prev => {
          // Kiểm tra xem tin nhắn đã tồn tại chưa
          const exists = prev.some(msg => msg.id === messageData.id);
          if (!exists) {
            return [...prev, messageData];
          }
          return prev;
        });
        
        // Cập nhật unread count nếu tin nhắn được gửi cho user hiện tại
        if (messageData.receiverType === userType && messageData.receiverId === normalizedUserId) {
          setUnreadCount(prev => prev + 1);
        }
      }
    };

    // Đăng ký event listener
    on('message_received', handleNewMessage);

    // Cleanup
    return () => {
      off('message_received', handleNewMessage);
    };
  }, [socket, isConnected, userType, normalizedUserId, otherType, normalizedOtherId, on, off]);

  // Reset initialization khi conversation thay đổi
  useEffect(() => {
    isInitialized.current = false;
    setMessages([]);
    setUnreadCount(0);
  }, [userType, normalizedUserId, otherType, normalizedOtherId]);

  // Đánh dấu đã đọc khi chat được mở
  useEffect(() => {
    // Chỉ đánh dấu đã đọc khi:
    // 1. Chat đang được mở (isOpen = true)
    // 2. Có tin nhắn
    // 3. Có tin nhắn chưa đọc từ người khác gửi cho mình
    if (isOpen && messages.length > 0 && userType && normalizedUserId && otherType && normalizedOtherId) {
      // Kiểm tra xem có tin nhắn nào được gửi cho user hiện tại chưa đọc không
      const hasUnreadMessages = messages.some(message => {
        const messageSenderId = message.sender_id || message.senderId;
        const messageSenderType = message.sender_type || message.senderType;
        const messageReceiverId = message.receiver_id || message.receiverId;
        const messageReceiverType = message.receiver_type || message.receiverType;
        
        // Tin nhắn được gửi cho user hiện tại và chưa đọc
        return messageReceiverId === normalizedUserId && 
               messageReceiverType === userType &&
               messageSenderId !== normalizedUserId && // Không phải tin nhắn của chính mình
               (!message.seen || message.seen === 0);
      });
      
      if (hasUnreadMessages) {
        // Đánh dấu đã đọc ngay khi mở chat
        markAsRead();
      }
    }
  }, [isOpen, messages.length, userType, normalizedUserId, otherType, normalizedOtherId, markAsRead]);

  // Đánh dấu đã đọc khi có tin nhắn mới trong khi chat đang mở
  useEffect(() => {
    // Chỉ đánh dấu đã đọc khi:
    // 1. Chat đang mở
    // 2. Có tin nhắn mới được gửi cho user hiện tại
    if (isOpen && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const messageSenderId = latestMessage.sender_id || latestMessage.senderId;
      const messageSenderType = latestMessage.sender_type || latestMessage.senderType;
      const messageReceiverId = latestMessage.receiver_id || latestMessage.receiverId;
      const messageReceiverType = latestMessage.receiver_type || latestMessage.receiverType;
      
      // Tin nhắn mới được gửi cho user hiện tại và chưa đọc
      if (messageReceiverId === normalizedUserId && 
          messageReceiverType === userType &&
          messageSenderId !== normalizedUserId && // Không phải tin nhắn của chính mình
          (!latestMessage.seen || latestMessage.seen === 0)) {
        
        // Delay một chút để đảm bảo user đã thấy tin nhắn
        const timer = setTimeout(() => {
          markAsRead();
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [messages.length, isOpen, userType, normalizedUserId, otherType, normalizedOtherId, markAsRead]);

  return {
    messages,
    loading,
    error,
    unreadCount,
    sendMessage,
    markAsRead,
    fetchMessages,
    fetchUnreadCount
  };
};

export default useMessages;
