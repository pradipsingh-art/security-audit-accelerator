/**
 * Audits GCP VPC Networks and Firewalls for security misconfigurations.
 * 
 * @param {Object} networksClient - Compute Networks SDK client
 * @param {Object} firewallsClient - Compute Firewalls SDK client
 * @param {string} projectId - GCP Project ID
 */
const auditNetworking = async (networksClient, firewallsClient, projectId) => {
  const findings = [];
  let scannedCount = 0;

  try {
    console.log(`[Networking] Starting VPC / Firewall audit for project: ${projectId}`);
    
    // 1. Audit VPC Networks
    try {
      const networksAggregated = await networksClient.listAsync({ project: projectId });
      for await (const network of networksAggregated) {
        scannedCount++;
        const netName = network.name;
        
        // Target 1: Default Network exists
        if (netName === 'default') {
          findings.push({
            id: `GCP-NET-DEFAULT-${projectId.substring(0, 8)}`,
            severity: 'Medium',
            resource: `VPC Network (default)`,
            issue: `The 'default' network exists in the project.`,
            remediation: `Delete the default network to ensure all network configurations are explicitly created with least privilege and custom subnets.`
          });
        }

        // Target 2: Legacy Networks
        const isLegacy = !network.autoCreateSubnetworks && network.subnetworks?.length === 0 && network.IPv4Range;
        if (isLegacy) {
          findings.push({
             id: `GCP-NET-LEGACY-${netName.substring(0, 8)}`,
             severity: 'High',
             resource: `VPC Network (${netName})`,
             issue: `Legacy Network detected.`,
             remediation: `Migrate to Subnet networks. Legacy networks have a single global IP range and cannot utilize regional subnets or advanced cloud features.`
          });
        }
      }
    } catch (netErr) {
       console.warn("[Networking] Failed to list VPCs:", netErr.message);
    }

    // 2. Audit Firewalls
    try {
       const firewallsAggregated = await firewallsClient.listAsync({ project: projectId });
       for await (const firewall of firewallsAggregated) {
         scannedCount++;
         
         // We only care about ingress rules allowing traffic
         if (firewall.direction === 'INGRESS' && !firewall.denied?.length) {
            const allowsAll = firewall.sourceRanges && firewall.sourceRanges.includes('0.0.0.0/0');
            
            if (allowsAll && firewall.allowed) {
               for (const allowed of firewall.allowed) {
                 const ports = allowed.ports || [];
                 // Target 3: SSH (22) unrestricted
                 if (allowed.IPProtocol === 'tcp' && ports.includes('22')) {
                    findings.push({
                      id: `GCP-FW-OPEN-SSH-${firewall.name.substring(0, 8)}`,
                      severity: 'Critical',
                      resource: `Firewall Rule (${firewall.name})`,
                      issue: `Firewall rule allows SSH (port 22) access from anywhere (0.0.0.0/0) on the internet.`,
                      remediation: `Restrict SSH access to specific known IP addresses or utilize Identity-Aware Proxy (IAP) for TCP forwarding.`
                    });
                 }
                 
                 // Target 4: RDP (3389) unrestricted
                 if (allowed.IPProtocol === 'tcp' && ports.includes('3389')) {
                    findings.push({
                      id: `GCP-FW-OPEN-RDP-${firewall.name.substring(0, 8)}`,
                      severity: 'Critical',
                      resource: `Firewall Rule (${firewall.name})`,
                      issue: `Firewall rule allows RDP (port 3389) access from anywhere (0.0.0.0/0) on the internet.`,
                      remediation: `Restrict RDP access to specific known IP addresses or utilize Identity-Aware Proxy (IAP) for TCP forwarding.`
                    });
                 }
               }
            }
         }
       }
    } catch (fwErr) {
       console.warn("[Networking] Failed to list Firewalls:", fwErr.message);
    }

    return { findings, scannedCount };

  } catch (error) {
    console.error("[Networking] Error during Networking audit:", error);
    return { findings: [], scannedCount: 0, error: error.message }; 
  }
};

module.exports = { auditNetworking };
