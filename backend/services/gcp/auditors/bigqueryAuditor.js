/**
 * Audits BigQuery Datasets for public exposure.
 * 
 * @param {Object} bigQueryClient - Authorized @google-cloud/bigquery SDK client
 * @param {string} projectId - GCP Project ID
 */
const auditBigQuery = async (bigQueryClient, projectId) => {
  const findings = [];
  let scannedCount = 0;

  try {
    console.log(`[BigQuery] Starting Dataset audit for project: ${projectId}`);
    
    // 1. Fetch all datasets
    const [datasets] = await bigQueryClient.getDatasets();
    scannedCount = datasets.length;

    // 2. Iterate and analyze each dataset's access controls
    for (const dataset of datasets) {
      try {
        const [metadata] = await dataset.getMetadata();
        const accessEntries = metadata.access || [];

        // Target Vulnerability: Is the dataset publicly accessible?
        // In BigQuery, this means an access entry grants a role to the specialGroup 'allAuthenticatedUsers' or 'allUsers' (sometimes represented as an IAM member if queried via IAM API, but BigQuery metadata uses specialGroup)
        
        const publicAccess = accessEntries.filter(entry => {
           return (entry.specialGroup === 'allAuthenticatedUsers') || 
                  (entry.specialGroup === 'allUsers') ||
                  (entry.iamMember === 'allAuthenticatedUsers') ||
                  (entry.iamMember === 'allUsers');
        });

        if (publicAccess.length > 0) {
           const exposedRoles = publicAccess.map(a => a.role).join(', ');
           findings.push({
            id: `GCP-BQ-PUBLIC-${dataset.id.substring(0, 8)}`,
            severity: 'Critical',
            resource: `BigQuery Dataset (${dataset.id})`,
            issue: `Dataset is publicly accessible. Exposed roles to allUsers: ${exposedRoles}`,
            remediation: `Remove 'allUsers' or 'allAuthenticatedUsers' from the dataset's access controls.`
          });
        }
      } catch (dsErr) {
        console.warn(`[BigQuery] Failed to fetch metadata for dataset ${dataset.id}:`, dsErr.message);
      }
    }

    return { findings, scannedCount };

  } catch (error) {
    console.error("[BigQuery] Error during BigQuery audit:", error);
    return { findings: [], scannedCount: 0, error: error.message }; 
  }
};

module.exports = { auditBigQuery };
