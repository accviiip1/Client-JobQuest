import { makeRequest } from "../axios.js";

const userService = {
  // Lấy thông tin user theo ID
  getUserById: async (userId) => {
    try {
      const response = await makeRequest.get(`/user/find/${userId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi lấy thông tin user:", error);
      return null;
    }
  },

  // Lấy thông tin company theo ID
  getCompanyById: async (companyId) => {
    try {
      const response = await makeRequest.get(`/company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi lấy thông tin company:", error);
      return null;
    }
  },

  // Lấy thông tin user/company theo type và ID
  getUserInfo: async (type, id) => {
    try {
      if (type === "user") {
        return await userService.getUserById(id);
      } else if (type === "company") {
        return await userService.getCompanyById(id);
      }
      return null;
    } catch (error) {
      console.error("❌ Lỗi lấy thông tin user/company:", error);
      return null;
    }
  }
};

export default userService;
