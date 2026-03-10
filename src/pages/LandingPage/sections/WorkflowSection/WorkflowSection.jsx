import React from 'react';
import styles from './WorkflowSection.module.css';
import Section from '../../../../components/Section/Section';

const steps = [
  {
    number: '01',
    title: 'Connect Your Cloud',
    description: 'Securely link your AWS, Azure, or Google Cloud accounts in just a few clicks using simple keys.'
  },
  {
    number: '02',
    title: 'Find Vulnerabilities',
    description: 'Our tool automatically scans over 200 security points across your infrastructure to find hidden vulnerabilities.'
  },
  {
    number: '03',
    title: 'Get Recommendations',
    description: 'See exactly what is wrong and get a list of easy, one-click steps to make your cloud safe again.'
  }
];

const WorkflowSection = () => {
  return (
    <Section 
      id="how-it-works"
      badge="THE PROCESS"
      title="Streamlined Audit Workflow"
      darker={true}
    >
      <div className={styles.workflowGrid}>
        {steps.map((step, index) => (
          <div key={index} className={styles.stepCard}>
            <div className={styles.stepNumber}>{step.number}</div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div className={styles.connector}></div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
};

export default WorkflowSection;
