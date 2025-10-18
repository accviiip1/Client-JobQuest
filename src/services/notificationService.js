import { makeRequest } from "../axios.js";

const notificationService = {
  // Tạo thông báo mới
  createNotification: async (notificationData) => {
    try {
      const response = await makeRequest.post("/notification/create", notificationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách thông báo
  getNotifications: async (userType, userId, limit = 20, offset = 0) => {
    try {
      const response = await makeRequest.get("/notification/list", {
        params: { userType, userId, limit, offset }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (notificationId) => {
    try {
      const response = await makeRequest.put(`/notification/mark-read/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async (userType, userId) => {
    try {
      const response = await makeRequest.put("/notification/mark-all-read", {
        userType,
        userId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy số thông báo chưa đọc
  getUnreadCount: async (userType, userId) => {
    try {
      const response = await makeRequest.get("/notification/unread-count", {
        params: { userType, userId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa thông báo
  deleteNotification: async (notificationId) => {
    try {
      const response = await makeRequest.delete(`/notification/delete/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa tất cả thông báo
  deleteAllNotifications: async (userType, userId) => {
    try {
      const response = await makeRequest.delete("/notification/delete-all", {
        data: { userType, userId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default notificationService;

