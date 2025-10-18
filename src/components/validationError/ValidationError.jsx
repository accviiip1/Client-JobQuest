import React from 'react';
import './ValidationError.scss';

const ValidationError = ({ message, className = "" }) => {
  if (!message) return null;
  
  return (
    <div className={`validation-error ${className}`}>
      <i className="fa-solid fa-exclamation-triangle"></i>
      <span>{message}</span>
    </div>
  );
};

export default ValidationError;



