const { execSync: exec } = require('child_process');

function formatTimestamp(date) {
  return date.toISOString()
    .replace(/-/g, '')
    .replace(/:/g, '')
    .replace('T', '')
    .split('.')[0];
}

module.exports = function action({ packageVersion, branchName, currentDate, host, username, password }) {
  const timestamp = formatTimestamp(currentDate);

  exec(`echo "registry=https://${host}/artifactory/api/npm/group-npm" > .npmrc`);
  exec('export npm_config_always_auth=true');
  exec(`export npm_config__auth=${password}`);
  exec(`export npm_config_email=${username}`);

  if (['main', 'master'].includes(branchName)) {
    exec('npm publish --tag latest');
  } else {
    const workingVersion = `${packageVersion}-${branchName}.${timestamp}`;
    exec(`npm --no-git-tag-version version ${workingVersion}`);
    exec(`npm publish --tag ${branchName}`);
  }
};
