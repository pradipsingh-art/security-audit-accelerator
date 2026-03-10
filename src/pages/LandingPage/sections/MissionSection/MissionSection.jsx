import React from 'react';
import styles from './MissionSection.module.css';
import Section from '../../../../components/Section/Section';

const MissionSection = () => {
  return (
    <Section 
      id="about-us"
      badge="WHO WE ARE"
      title="Simple Security, Pure Peace of Mind."
      className={styles.missionSection}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.textContent}>
          <div className={styles.missionBlock}>
            <div className={styles.iconWrapper}>🛡️</div>
            <h3 className={styles.blockTitle}>Our Expert Platform</h3>
            <p className={styles.blockDescription}>
              Our platform makes cloud safety easy for everyone. We know security can be complex, so we built AuditScope to automate your protection.
            </p>
          </div>
          
          <div className={styles.missionBlock}>
            <div className={styles.iconWrapper}>🎯</div>
            <h3 className={styles.blockTitle}>Our Simple Mission</h3>
            <p className={styles.blockDescription}>
              Our goal is to protect your data with just one click. We handle the hard work so you can focus on building your business without any worry.
            </p>
          </div>
        </div>

        <div className={styles.imageColumn}>
          <div className={styles.glassPanel}>
            <div className={styles.dashboardMock}>
              <div className={styles.mockHeader}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
              <div className={styles.mockBody}>
                <div className={styles.mockScore}>
                  <div className={styles.scoreCircle}>98%</div>
                  <div className={styles.scoreText}>Security Score</div>
                </div>
                <div className={styles.mockBars}>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                </div>
              </div>
            </div>
            {/* Visual background glow inside the panel */}
            <div className={styles.panelGlow}></div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default MissionSection;
