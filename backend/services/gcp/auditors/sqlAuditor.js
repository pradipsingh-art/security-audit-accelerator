const { google } = require('googleapis');

/**
 * Audits Cloud SQL instances for security misconfigurations.
 * 
 * @param {Object} googleAuthClient - Authorized googleapis client
 * @param {string} projectId - GCP Project ID
 */
const auditCloudSQL = async (googleAuthClient, projectId) => {
  const findings = [];
  let scannedCount = 0;

  try {
    console.log(`[Cloud SQL] Starting SQL audit for project: ${projectId}`);
    
    const sqlAdmin = google.sqladmin({ version: 'v1beta4', auth: googleAuthClient });

    const response = await sqlAdmin.instances.list({ project: projectId });
    const instances = response.data.items || [];
    scannedCount = instances.length;

    for (const instance of instances) {
      const config = instance.settings;
      if (!config) continue;

      // 1. Check Require SSL
      const requireSsl = config.ipConfiguration?.requireSsl;
      if (!requireSsl) {
        findings.push({
          id: `GCP-SQL-SSL-${instance.name.substring(0, 8)}`,
          severity: 'Critical',
          resource: `Cloud SQL Database (${instance.name})`,
          issue: `Incoming connections are NOT required to use SSL.`,
          remediation: `Modify the instance network settings to explicitly require SSL for all incoming connections.`
        });
      }

      // 2. Check for Public IPs and 0.0.0.0/0 Authorized Networks
      if (config.ipConfiguration) {
        const ipAddresses = instance.ipAddresses || [];
        const hasPublicIp = ipAddresses.some(ip => ip.type === 'PRIMARY'); // Typically PRIMARY implies external in Cloud SQL unless Private Services Access is solely used

        if (hasPublicIp) {
           findings.push({
            id: `GCP-SQL-PUBLIC-${instance.name.substring(0, 8)}`,
            severity: 'High',
            resource: `Cloud SQL Database (${instance.name})`,
            issue: `Database Instance possesses a Public IP address.`,
            remediation: `Configure the instance to use Private IP only for internal VPC communication if public access isn't strictly necessary.`
          });
        }

        const authNetworks = config.ipConfiguration.authorizedNetworks || [];
        const allowsAllAccess = authNetworks.some(net => net.value === '0.0.0.0/0' || net.value === '::/0');
        
        if (allowsAllAccess) {
          findings.push({
            id: `GCP-SQL-OPEN-${instance.name.substring(0, 8)}`,
            severity: 'Critical',
            resource: `Cloud SQL Database (${instance.name})`,
            issue: `Authorized networks explicitly whitelist all public IPs (0.0.0.0/0).`,
            remediation: `Remove 0.0.0.0/0 from Authorized Networks. Restrict access to specific, known IP ranges or utilize Cloud SQL Proxy.`
          });
        }
      }

      // 3. Check Automated Backups
      const backupEnabled = config.backupConfiguration?.enabled;
      if (!backupEnabled) {
        findings.push({
          id: `GCP-SQL-BACKUP-${instance.name.substring(0, 8)}`,
          severity: 'High',
          resource: `Cloud SQL Database (${instance.name})`,
          issue: `Automated Backups are NOT configured.`,
          remediation: `Enable automated daily backups to protect against data loss.`
        });
      }
    }

    return { findings, scannedCount };

  } catch (error) {
    console.error("[Cloud SQL] Error during SQL audit:", error);
    return { findings: [], scannedCount: 0, error: error.message }; 
  }
};

module.exports = { auditCloudSQL };
