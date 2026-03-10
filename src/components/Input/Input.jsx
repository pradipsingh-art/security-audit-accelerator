import React from 'react';
import styles from './Input.module.css';

const Input = React.forwardRef(({ 
  label, 
  error, 
  className = '', 
  id, 
  ...props 
}, ref) => {
  const generatedId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      {label && (
        <label htmlFor={generatedId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={generatedId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
