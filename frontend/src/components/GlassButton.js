import React from 'react';

const GlassButton = ({ 
  children, 
  onClick, 
  variant = 'light', 
  className = '',
  type = 'button',
  disabled = false,
  icon = null,
  ...props 
}) => {
  const variantClass = variant === 'primary' ? 'glass-button-primary' : 'glass-button-light';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`glass-button ${variantClass} ${className}`}
      {...props}
    >
      <div className="glass-button-effect"></div>
      <div className="glass-button-tint"></div>
      <div className="glass-button-shine"></div>
      <div className="glass-button-content">
        {icon && <span className="glass-button-icon">{icon}</span>}
        {children}
      </div>
    </button>
  );
};

export default GlassButton;
