// Utility function để xử lý avatar URL
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    return null; // Trả về null để sử dụng placeholder
  }
  
  // Nếu đã là URL đầy đủ
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // Nếu bắt đầu bằng /, thêm base URL
  if (avatarPath.startsWith('/')) {
    return `http://localhost:8800${avatarPath}`;
  }
  
  // Nếu chỉ là tên file, thêm images folder
  return `http://localhost:8800/images/${avatarPath}`;
};

// Function để xử lý avatar cho user/company details
export const getAvatarFromDetails = (details, type = 'user') => {
  if (!details) return null;
  
  // Cho company, ưu tiên avatar field (đã được alias)
  if (type === 'company') {
    return getAvatarUrl(details.avatar || details.avatarPic);
  }
  
  // Cho user, ưu tiên avatarPic
  return getAvatarUrl(details.avatarPic || details.avatar);
};

// Function để tạo placeholder avatar với chữ cái đầu
export const getPlaceholderAvatar = (name, size = 56) => {
  if (!name) {
    return `https://via.placeholder.com/${size}x${size}/667eea/ffffff?text=U`;
  }
  
  const initial = name.charAt(0).toUpperCase();
  return `https://via.placeholder.com/${size}x${size}/667eea/ffffff?text=${initial}`;
};
