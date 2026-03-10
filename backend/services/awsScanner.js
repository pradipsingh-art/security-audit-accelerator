const { IAMClient, ListUsersCommand, ListAccessKeysCommand, GetLoginProfileCommand } = require('@aws-sdk/client-iam');
const { EC2Client, DescribeInstancesCommand, DescribeSecurityGroupsCommand } = require('@aws-sdk/client-ec2');
const { S3Client, ListBucketsCommand, GetPublicAccessBlockCommand } = require('@aws-sdk/client-s3');

async function auditAwsIam(credentials) {
  const findings = [];
  let scannedCount = 0;
  
  try {
    const client = new IAMClient({
      region: credentials.region || 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });

    const data = await client.send(new ListUsersCommand({}));
    const users = data.Users || [];
    scannedCount += users.length;

    for (const user of users) {
      try {
         // Check for active access keys
         const keysData = await client.send(new ListAccessKeysCommand({ UserName: user.UserName }));
         const keys = keysData.AccessKeyMetadata || [];
         if (keys.length > 0) {
           findings.push({
             id: `iam-active-key-${user.UserName}`,
             severity: 'Medium',
             resource: `IAM User (${user.UserName})`,
             issue: 'User has active long-term access keys. Consider using temporary STS credentials or federated access.'
           });
         }
      } catch (err) {
         // permissions error
      }
    }
  } catch (err) {
    console.error('[AWS Scanner] IAM Error:', err.message);
    findings.push({
       id: 'iam-access-denied',
       severity: 'High',
       resource: 'AWS IAM Service',
       issue: `Failed to scan IAM resources: ${err.message}`
    });
  }

  return { findings, scannedCount };
}

async function auditAwsEc2(credentials) {
  const findings = [];
  let scannedCount = 0;
  
  try {
    const client = new EC2Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });

    const data = await client.send(new DescribeInstancesCommand({}));
    const reservations = data.Reservations || [];
    
    reservations.forEach(reservation => {
      const instances = reservation.Instances || [];
      instances.forEach(instance => {
        scannedCount++;
        const instanceId = instance.InstanceId;
        const nameTag = instance.Tags?.find(t => t.Key === 'Name')?.Value || instanceId;

        // Check 1: Public IP
        if (instance.PublicIpAddress) {
           findings.push({
             id: `ec2-public-ip-${instanceId}`,
             severity: 'High',
             resource: `EC2 Instance (${nameTag})`,
             issue: 'Instance has a direct Public IP address assigned. Consider using a Load Balancer or NAT Gateway.'
           });
        }
        
        // Check 2: Unencrypted Root Volume (Metadata check limited without DescribeVolumes, but good enough as conceptual)
      });
    });

    // Security Groups Audit
    const sgData = await client.send(new DescribeSecurityGroupsCommand({}));
    const sgs = sgData.SecurityGroups || [];
    sgs.forEach(sg => {
      scannedCount++;
      const permissions = sg.IpPermissions || [];
      permissions.forEach(perm => {
        const hasOpenCidr = perm.IpRanges?.some(range => range.CidrIp === '0.0.0.0/0');
        if (hasOpenCidr) {
           if (perm.FromPort === 22) {
             findings.push({
               id: `ec2-sg-open-ssh-${sg.GroupId}`,
               severity: 'Critical',
               resource: `Security Group (${sg.GroupName})`,
               issue: 'Security Group allows SSH (port 22) from ANY IP address (0.0.0.0/0).'
             });
           } else if (perm.FromPort === 3389) {
             findings.push({
               id: `ec2-sg-open-rdp-${sg.GroupId}`,
               severity: 'Critical',
               resource: `Security Group (${sg.GroupName})`,
               issue: 'Security Group allows RDP (port 3389) from ANY IP address (0.0.0.0/0).'
             });
           } else if (perm.FromPort === 0 || perm.FromPort === -1) {
             findings.push({
               id: `ec2-sg-open-all-${sg.GroupId}`,
               severity: 'High',
               resource: `Security Group (${sg.GroupName})`,
               issue: 'Security Group allows ALL traffic from ANY IP address (0.0.0.0/0).'
             });
           }
        }
      });
    });

  } catch (err) {
    console.error('[AWS Scanner] EC2 Error:', err.message);
    findings.push({
       id: 'ec2-access-denied',
       severity: 'Medium',
       resource: 'AWS EC2 Service',
       issue: `Failed to scan EC2 resources: ${err.message}`
    });
  }

  return { findings, scannedCount };
}

async function auditAwsS3(credentials) {
  const findings = [];
  let scannedCount = 0;
  
  try {
    const client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });

    const data = await client.send(new ListBucketsCommand({}));
    const buckets = data.Buckets || [];
    scannedCount += buckets.length;

    for (const bucket of buckets) {
      try {
        const publicBlockData = await client.send(new GetPublicAccessBlockCommand({ Bucket: bucket.Name }));
        const conf = publicBlockData.PublicAccessBlockConfiguration;
        if (!conf || !conf.BlockPublicAcls || !conf.BlockPublicPolicy || !conf.IgnorePublicAcls || !conf.RestrictPublicBuckets) {
           findings.push({
             id: `s3-public-block-${bucket.Name}`,
             severity: 'High',
             resource: `S3 Bucket (${bucket.Name})`,
             issue: 'Bucket is missing one or more Block Public Access settings.'
           });
        }
      } catch (err) {
        if (err.name === 'NoSuchPublicAccessBlockConfiguration') {
          findings.push({
             id: `s3-public-block-missing-${bucket.Name}`,
             severity: 'High',
             resource: `S3 Bucket (${bucket.Name})`,
             issue: 'Bucket does not have Block Public Access configured, risking public exposure.'
           });
        } else {
           // other errors
        }
      }
    }
  } catch (err) {
    console.error('[AWS Scanner] S3 Error:', err.message);
    findings.push({
       id: 's3-access-denied',
       severity: 'Medium',
       resource: 'AWS S3 Service',
       issue: `Failed to scan S3 buckets: ${err.message}`
    });
  }

  return { findings, scannedCount };
}

module.exports = {
  auditAwsIam,
  auditAwsEc2,
  auditAwsS3
};
