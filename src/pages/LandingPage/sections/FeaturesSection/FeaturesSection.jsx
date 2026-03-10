import React from 'react';
import styles from './FeaturesSection.module.css';
import Section from '../../../../components/Section/Section';
import Card from '../../../../components/Card/Card';

const features = [
  {
    icon: '👤',
    title: 'Control Who Has Access',
    description: 'See exactly who can use your cloud accounts. Remove old users or extra permissions to keep your data safe and private.'
  },
  {
    icon: '📁',
    title: 'Protect Your Files',
    description: 'We check all your storage folders. If any files are open for anyone to see, we help you lock them down quickly before hackers find them.'
  },
  {
    icon: '🌐',
    title: 'Secure Your Network',
    description: 'We scan your firewalls and network settings. We find any "open doors" that could let attackers into your servers and show you how to close them.'
  }
];

const FeaturesSection = () => {
  return (
    <Section 
      id="features"
      badge="WHAT WE DO"
      title="How We Find Vulnerabilities for You"
      subtitle="Complete visibility across your hybrid environment."
      darker={true}
    >
      <div className={styles.grid}>
        {features.map((feature, index) => (
          <Card key={index} className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              {feature.icon}
            </div>
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardDescription}>{feature.description}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default FeaturesSection;
