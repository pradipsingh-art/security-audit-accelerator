import React, { useState } from 'react';
import AuthLayout from '../AuthLayout';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import styles from './ResetPasswordPage.module.css';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Extract email from url params
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || 'your email';

  const handleSubmit = (e) => {
    e.preventDefault();
    if(password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log('Resetting password for:', email);
    setIsSubmitted(true);
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  return (
    <AuthLayout 
      title="Create New Password" 
      subtitle="Your new password must be different from previously used passwords."
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input 
          label="New Password" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isSubmitted}
        />

        <Input 
          label="Confirm Password" 
          type="password" 
          placeholder="••••••••" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isSubmitted}
        />
        
        <Button 
          type="submit" 
          variant="primary" 
          className={styles.submitBtn}
          disabled={isSubmitted}
        >
          {isSubmitted ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
