import React from 'react';
import './Card.css';

// Accept className and any other props (...props)
const Card = ({ children, className = '', ...props }) => {
  return (
    // Spread the props onto the div, including onClick
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;