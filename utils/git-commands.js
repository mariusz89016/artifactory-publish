const { execSync } = require('child_process');

module.exports = {
  getBranchName: () => {
    const stdout = execSync('git symbolic-ref --short -q HEAD');
    return String(stdout).trim();
  },
};
