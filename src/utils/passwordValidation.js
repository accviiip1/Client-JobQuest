/**
 * Utility function để validate mật khẩu
 * @param {string} password - Mật khẩu cần validate
 * @param {string} confirmPassword - Mật khẩu xác nhận
 * @returns {object} - Object chứa isValid và errors
 */
export const validatePasswordForm = (password, confirmPassword) => {
  const errors = [];
  
  // Kiểm tra mật khẩu có tồn tại
  if (!password) {
    errors.push("Vui lòng nhập mật khẩu.");
  }
  
  // Kiểm tra mật khẩu xác nhận có tồn tại
  if (!confirmPassword) {
    errors.push("Vui lòng nhập mật khẩu xác nhận.");
  }
  
  // Nếu có mật khẩu, kiểm tra độ dài
  if (password && password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự.");
  }
  
  // Kiểm tra mật khẩu có chứa ít nhất 1 chữ cái và 1 số
  if (password && !/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số.");
  }
  
  // Kiểm tra mật khẩu và mật khẩu xác nhận có khớp nhau
  if (password && confirmPassword && password !== confirmPassword) {
    errors.push("Mật khẩu xác nhận không khớp.");
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Validate chỉ mật khẩu đơn lẻ
 * @param {string} password - Mật khẩu cần validate
 * @returns {object} - Object chứa isValid và errors
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push("Vui lòng nhập mật khẩu.");
  } else {
    if (password.length < 6) {
      errors.push("Mật khẩu phải có ít nhất 6 ký tự.");
    }
    
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      errors.push("Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số.");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};



