import React from 'react';
import './Button.css';

const Button = ({ children, onClick, variant = 'primary' }) => {
  const buttonClass = `btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`;
  return (
    <button className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;