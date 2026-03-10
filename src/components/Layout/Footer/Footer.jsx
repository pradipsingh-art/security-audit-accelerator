import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContent}`}>
        <div className={styles.brandColumn}>
          <div className={styles.logo}>
            <img src="/assets/logo.png" alt="Logo" className={styles.logoImg} />
          </div>
          <p className={styles.description}>
            The leading enterprise auditing tool for multi-cloud security and compliance.
          </p>
        </div>

        <div className={styles.linksColumn}>
          <h4 className={styles.linkGroupTitle}>Product</h4>
          <ul className={styles.linkList}>
            <li><a href="/">Features</a></li>
            <li><a href="/">Integrations</a></li>
            <li><a href="/">Enterprise</a></li>
            <li><a href="/">Solutions</a></li>
          </ul>
        </div>

        <div className={styles.linksColumn}>
          <h4 className={styles.linkGroupTitle}>Security</h4>
          <ul className={styles.linkList}>
            <li><a href="/">Privacy Policy</a></li>
            <li><a href="/">Terms of Service</a></li>
            <li><a href="/">Security Overview</a></li>
            <li><a href="/">Trust Center</a></li>
          </ul>
        </div>

        <div className={styles.linksColumn}>
          <h4 className={styles.linkGroupTitle}>Resources</h4>
          <ul className={styles.linkList}>
            <li><a href="/">Documentation</a></li>
            <li><a href="/">API Reference</a></li>
            <li><a href="/">Guide</a></li>
            <li><a href="/">Support</a></li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.footerBottom}`}>
        <p>&copy; {currentYear} Cloud Ambassadors. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
