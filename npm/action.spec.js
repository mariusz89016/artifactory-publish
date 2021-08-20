jest.mock('child_process', () => ({ execSync: jest.fn() }));

const { execSync } = require('child_process');
const action = require('./action');

const TEST_DATE = new Date('2021-08-19T12:34:56Z');

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should correctly setup npm before publishing', () => {
    // when
    action({
      host: 'company.artifactory.allegro',
      username: 'test-user',
      password: 'test-user-password',
      currentDate: TEST_DATE,
    });

    // then
    expect(execSync.mock.calls.slice(0, 4)).toEqual([
      ['echo "registry=https://company.artifactory.allegro/artifactory/api/npm/group-npm" > .npmrc'],
      ['export npm_config_always_auth=true'],
      ['export npm_config__auth=test-user-password'],
      ['export npm_config_email=test-user'],
    ]);
  });

  [
    {
      inputData: {
        packageVersion: '1.2.3',
        branchName: 'main',
      },
      expectedCommands: [
        ['npm publish --tag latest'],
      ]
    }, {
      inputData: {
        packageVersion: '1.2.3',
        branchName: 'master',
      },
      expectedCommands: [
        ['npm publish --tag latest'],
      ]
    }, {
      inputData: {
        packageVersion: '1.2.3',
        branchName: 'feature/TICKET-6789-test-feature',
      },
      expectedCommands: [
        ['npm --no-git-tag-version version 1.2.3-feature/TICKET-6789-test-feature.20210819123456'],
        ['npm publish --tag feature/TICKET-6789-test-feature'],
      ]
    }
  ].forEach(({ inputData, expectedCommands }) => {
    test(`should correctly publish package with version ${inputData.packageVersion} from ${inputData.branchName} branch`, () => {
      // when
      action({
        currentDate: TEST_DATE,
        ...inputData,
      });

      // then
      expect(execSync.mock.calls.slice(4)).toEqual(expectedCommands);
    });
  });
});
