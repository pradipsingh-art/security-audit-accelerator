import React, { useState } from 'react';
import AuthLayout from '../AuthLayout';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import styles from './ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sending OTP to:', email);
    // Simulate API call
    setIsSubmitted(true);
    
    // In a real app, transition to Verify OTP view or redirect
    setTimeout(() => {
      window.location.href = '/verify-otp?email=' + encodeURIComponent(email) + '&context=reset';
    }, 1500);
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle={isSubmitted ? "Sending reset code..." : "Enter your email to receive a secure OTP code"}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="name@company.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitted}
        />
        
        <Button 
          type="submit" 
          variant="primary" 
          className={styles.submitBtn}
          disabled={isSubmitted}
        >
          {isSubmitted ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </form>

      <div className={styles.footerText}>
        <a href="/login" className={styles.link}>Return to Log in</a>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
