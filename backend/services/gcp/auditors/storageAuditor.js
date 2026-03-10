/**
 * Scans a GCP project's Cloud Storage Buckets for public exposure vulnerabilities.
 * 
 * @param {Object} storageClient - Instantiated @google-cloud/storage SDK client
 * @param {string} projectId - The GCP Project ID being scanned
 * @returns {Object} An object containing the findings array and count of scanned buckets
 */
const auditStorageBuckets = async (storageClient, projectId) => {
  const findings = [];
  let scannedCount = 0;

  try {
    console.log(`[Storage] Starting bucket audit for project: ${projectId}`);
    
    // 1. Fetch all buckets in the project
    const [buckets] = await storageClient.getBuckets();
    console.log(`[Storage] Found ${buckets.length} buckets.`);

    // 2. Iterate and analyze each bucket's IAM policy
    for (const bucket of buckets) {
      scannedCount++;
      const bucketName = bucket.name;
      
      try {
        const [policy] = await bucket.iam.getPolicy({ requestedPolicyVersion: 3 });
        const [metadata] = await bucket.getMetadata();
        
        // Target Vulnerability 1: Publicly accessible bucket
        if (policy.bindings) {
          const publicBindings = policy.bindings.filter(binding => {
            return binding.members && (
              binding.members.includes('allUsers') || 
              binding.members.includes('allAuthenticatedUsers')
            );
          });

          if (publicBindings.length > 0) {
            const exposedRoles = publicBindings.map(b => b.role).join(', ');
            findings.push({
              id: `GCP-STORAGE-PUBLIC-${bucketName.substring(0, 8)}`,
              severity: 'Critical',
              resource: `Storage Bucket (${bucketName})`,
              issue: `Bucket is publicly accessible. Exposed roles: ${exposedRoles}`,
              remediation: `Remove 'allUsers' and 'allAuthenticatedUsers' from the IAM policy.`
            });
          }
        }

        // Target Vulnerability 2: Uniform Bucket-Level Access disabled
        const ublaEnabled = metadata.iamConfiguration && 
                            metadata.iamConfiguration.uniformBucketLevelAccess && 
                            metadata.iamConfiguration.uniformBucketLevelAccess.enabled === true;
                            
        if (!ublaEnabled) {
          findings.push({
            id: `GCP-STORAGE-UBLA-${bucketName.substring(0, 8)}`,
            severity: 'Medium',
            resource: `Storage Bucket (${bucketName})`,
            issue: `Uniform Bucket-Level Access (UBLA) is NOT enabled.`,
            remediation: `Enable UBLA to unify and simplify access control to prevent accidental ACL misconfigurations.`
          });
        }

      } catch (iamError) {
        console.warn(`[Storage] Failed to fetch IAM policy for bucket ${bucketName}. Missing storage.buckets.getIamPolicy permission?`, iamError.message);
        // We could optionally push a 'Warning' finding here about insufficient permissions to audit certain resources
      }
    }

    return {
      findings,
      scannedCount
    };

  } catch (error) {
    console.error("[Storage] Critical error during bucket audit:", error);
    throw new Error(`Cloud Storage Audit Failed: ${error.message}`);
  }
};

module.exports = {
  auditStorageBuckets
};
