const { google } = require('googleapis');

/**
 * Audits GCP IAM & Admin configurations according to the checklist.
 * 
 * @param {Object} googleAuthClient - The authorized googleapis client
 * @param {string} projectId - The GCP Project ID
 */
const auditIAM = async (googleAuthClient, projectId) => {
  const findings = [];
  let scannedCount = 0;

  try {
    console.log(`[IAM] Starting IAM audit for project: ${projectId}`);
    
    // Initialize googleapis resources
    const iam = google.iam({ version: 'v1', auth: googleAuthClient });
    const cloudresourcemanager = google.cloudresourcemanager({ version: 'v1', auth: googleAuthClient });

    // 1. Audit Project-Level IAM Policy (Check for Admin privileges and SA Token Creator)
    try {
      const response = await cloudresourcemanager.projects.getIamPolicy({
        resource: projectId,
        requestBody: {}
      });
      const policy = response.data;
      
      if (policy && policy.bindings) {
        policy.bindings.forEach(binding => {
          // Check if Service Accounts have admin/owner privileges
          if (binding.role === 'roles/owner' || binding.role === 'roles/editor') {
            const serviceAccounts = binding.members.filter(m => m.startsWith('serviceAccount:'));
            serviceAccounts.forEach(sa => {
              findings.push({
                id: `GCP-IAM-SA-ADMIN-${sa.substring(15, 23)}`,
                severity: 'High',
                resource: `IAM Policy (Project: ${projectId})`,
                issue: `Service Account ${sa.replace('serviceAccount:', '')} has primitive admin privileges (${binding.role}).`,
                remediation: `Apply the Principle of Least Privilege by removing primitive roles and replacing them with specific predefined roles.`
              });
            });
          }

          // Check for Service Account User / Token Creator at project level
          if (binding.role === 'roles/iam.serviceAccountUser' || binding.role === 'roles/iam.serviceAccountTokenCreator') {
            const users = binding.members.filter(m => m.startsWith('user:'));
            users.forEach(user => {
              findings.push({
                id: `GCP-IAM-PROJECT-TOKEN-${user.substring(5, 13)}`,
                severity: 'Medium',
                resource: `IAM Policy (Project: ${projectId})`,
                issue: `User ${user.replace('user:', '')} has ${binding.role} at the Project Level.`,
                remediation: `Remove the role from the project level. Assign it specifically to the individual Service Account the user needs access to.`
              });
            });
          }
        });
      }
    } catch (iamPolErr) {
       console.warn("[IAM] Failed to fetch project IAM Policy:", iamPolErr.message);
    }

    // 2. Audit Service Account Keys
    try {
      const saResponse = await iam.projects.serviceAccounts.list({
        name: `projects/${projectId}`
      });
      
      const serviceAccounts = saResponse.data.accounts || [];
      scannedCount += serviceAccounts.length;

      for (const sa of serviceAccounts) {
        const keyResponse = await iam.projects.serviceAccounts.keys.list({
          name: sa.name,
          keyTypes: ['USER_MANAGED'] // Only fetch user-managed keys
        });

        const userManagedKeys = keyResponse.data.keys || [];
        if (userManagedKeys.length > 0) {
           findings.push({
            id: `GCP-IAM-USER-KEY-${sa.email.substring(0, 8)}`,
            severity: 'Medium',
            resource: `Service Account (${sa.email})`,
            issue: `Service Account has ${userManagedKeys.length} User-Managed Key(s). GCP-managed keys are preferred.`,
            remediation: `Ensure User-Managed keys are strictly necessary. If so, ensure they are rotated every 90 days. Prefer relying on GCP-managed short-lived credentials.`
          });
        }
      }
    } catch (saErr) {
      console.warn("[IAM] Failed to list Service Accounts:", saErr.message);
    }

    return { findings, scannedCount };

  } catch (error) {
    console.error("[IAM] Critical error during IAM audit:", error);
    return { findings: [], scannedCount: 0, error: error.message }; 
  }
};

module.exports = { auditIAM };
