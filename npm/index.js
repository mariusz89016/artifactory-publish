const path = require('path');
const core = require('@actions/core');
const action = require('./action');
const { getBranchName } = require('../utils/git-commands');
const { reportAction } = require('@gh-stats/reporter');

try {
  action({
    packageVersion: require(path.join(process.env['GITHUB_WORKSPACE'], 'package.json')).version,
    branchName: getBranchName(),
    currentDate: new Date(),
    host: core.getInput('host'),
    username: core.getInput('username'),
    password: core.getInput('password'),
  });
} catch (e) {
  core.setFailed(e);
}

reportAction();
