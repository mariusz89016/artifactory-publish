const { execSync: exec } = require('child_process');
const core = require('@actions/core');
const { publishProvisioning } = require('../utils/provisioning');
const { provisioningArtifactUrl, artifactVersion } = require('../utils/artifactory');

const host = core.getInput('host');
const username = core.getInput('username');
const password = core.getInput('password');
const name = core.getInput('name');
const path = core.getInput('path');
const version = core.getInput('version');
const dockerfile = core.getInput('dockerfile') || 'Dockerfile';
const context = core.getInput('context') || '.';
const tychoPath = core.getInput('tycho');
const provisioningPath = core.getInput('provisioning');
const skipProvisioning = core.getInput('skipProvisioning');

const imageTag = `${host}/${path}/${name}`;

const currentBranch = process.env['GITHUB_HEAD_REF'] || process.env['GITHUB_REF'].split('/').pop();
core.info(`current branch: ${currentBranch}`);
const isSnapshot = !['master', 'main'].includes(currentBranch);
if (isSnapshot) core.info('this is a snapshot release');

const timestamp = Date.now();

try {
  const targetVersion = `${artifactVersion(version, currentBranch, isSnapshot)}-${timestamp}`;
  exec(`docker login -u ${username} -p ${password} ${host}`);
  core.info(`logged into ${host}`);
  exec(`docker build -f ${dockerfile} -t ${imageTag}:${targetVersion} ${context}`);
  core.info('docker build successfully');
  exec(`docker push ${imageTag}:${targetVersion}`);
  core.info(`docker push finished ${imageTag}:${targetVersion}`);
} catch (e) {
  core.setFailed(e);
}

if (!skipProvisioning) {
  publishProvisioning(tychoPath, provisioningPath, provisioningArtifactUrl(username, password, host, path, name, version, currentBranch, isSnapshot, `-${timestamp}`))
    .then(provisioningTargetUrl => core.setOutput('url', provisioningTargetUrl))
    .catch((e) => core.setFailed(e));
}