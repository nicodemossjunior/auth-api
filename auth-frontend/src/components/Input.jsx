import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  error = '', 
  disabled = false, 
  required = false, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'input';
  
  const errorClasses = error ? 'input-error' : '';

  const classes = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div className="form-group">
      {label && (
        <label 
          htmlFor={name} 
          className="form-label"
        >
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={classes}
        {...props}
      />
      {error && (
        <p className="form-error">
          <svg 
            className="w-4 h-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
