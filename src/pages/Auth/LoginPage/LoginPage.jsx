import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import AuthLayout from '../AuthLayout';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      window.location.href = '/dashboard';
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Enter your credentials to access your account"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div style={{color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center'}}>{error}</div>}
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="name@company.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <div className={styles.passwordGroup}>
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <a href="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </a>
        </div>
        
        <Button type="submit" variant="primary" className={styles.submitBtn}>
          Log In
        </Button>
      </form>

      <div className={styles.footerText}>
        Don't have an account? <a href="/register" className={styles.link}>Sign up</a>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
