import { makeRequest } from "../axios.js";

const messageService = {
  // Gửi tin nhắn
  sendMessage: async (messageData) => {
    try {
      // Validation dữ liệu trước khi gửi
      if (!messageData.senderType || !messageData.senderId || 
          !messageData.receiverType || !messageData.receiverId || 
          !messageData.text) {
        throw new Error("Thiếu thông tin bắt buộc để gửi tin nhắn");
      }
      

      
      const response = await makeRequest.post("/message/send", messageData);
      return response.data;
    } catch (error) {
      console.error("Lỗi trong messageService.sendMessage:", {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
        messageData: messageData
      });
      
      // Nếu có response từ server, trả về thông báo lỗi từ server
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // Nếu không có response, trả về lỗi mặc định
      throw new Error(error.message || "Lỗi kết nối server");
    }
  },

  // Lấy tin nhắn giữa 2 người dùng
  getMessages: async (userType, userId, otherType, otherId) => {
    try {
      const response = await makeRequest.get("/message/messages", {
        params: { userType, userId, otherType, otherId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách cuộc trò chuyện
  getConversations: async (userType, userId) => {
    try {
      const response = await makeRequest.get("/message/conversations", {
        params: { userType, userId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: async (userType, userId, otherType, otherId) => {
    try {
      const response = await makeRequest.put("/message/mark-read", {
        userType,
        userId,
        otherType,
        otherId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy tổng số tin nhắn chưa đọc
  getUnreadCount: async (userType, userId) => {
    try {
      const response = await makeRequest.get("/message/unread-count", {
        params: { userType, userId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy số tin nhắn chưa đọc cho conversation cụ thể
  getConversationUnreadCount: async (userType, userId, otherType, otherId) => {
    try {
      const response = await makeRequest.get("/message/conversation-unread-count", {
        params: { userType, userId, otherType, otherId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default messageService;
