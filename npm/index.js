const core = require('@actions/core');
const action = require('./action');
const { getBranchName } = require('../utils/git-commands');

try {
  action({
    packageVersion: require('./package.json').version,
    branchName: getBranchName(),
    currentDate: new Date(),
    host: core.getInput('host'),
    username: core.getInput('username'),
    password: core.getInput('password'),
  });
} catch (e) {
  core.setFailed(e);
}
