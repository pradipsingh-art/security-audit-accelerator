import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import AuthLayout from '../AuthLayout';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await register(name, email, password);
    if (result.success) {
      window.location.href = '/dashboard';
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <AuthLayout 
      title="Create an Account" 
      subtitle="Join AuditScope to secure your cloud infrastructure"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div style={{color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center'}}>{error}</div>}
        <Input 
          label="Full Name" 
          type="text" 
          placeholder="John Doe" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input 
          label="Work Email" 
          type="email" 
          placeholder="name@company.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input 
          label="Password" 
          type="password" 
          placeholder="Create a strong password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Button type="submit" variant="primary" className={styles.submitBtn}>
          Create Account
        </Button>
      </form>

      <div className={styles.termsText}>
        By signing up, you agree to our <a href="/">Terms of Service</a> and <a href="/">Privacy Policy</a>.
      </div>

      <div className={styles.footerText}>
        Already have an account? <a href="/login" className={styles.link}>Log in</a>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
