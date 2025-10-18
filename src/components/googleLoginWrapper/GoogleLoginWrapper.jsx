import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginWrapper = ({ onSuccess, onError }) => {
  // Thay YOUR_CLIENT_ID bằng Client ID thực tế từ Google Console
  const CLIENT_ID = "731129733070-dqcr..."; // Bạn cần thay bằng Client ID đầy đủ

  const handleSuccess = (credentialResponse) => {
    console.log('Google Login Success:', credentialResponse);
    if (onSuccess) {
      onSuccess(credentialResponse);
    }
  };

  const handleError = (error) => {
    console.error('Google Login Error:', error);
    if (onError) {
      onError(error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap={false}
      theme="outline"
      size="large"
      text="continue_with"
      shape="rectangular"
      logo_alignment="left"
      width="100%"
    />
  );
};

export default GoogleLoginWrapper;