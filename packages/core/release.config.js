/**
 * @file release.config.js
 * @description Configuration file for semantic-release. 
 * This file defines the release process for the project, including the branches to release from and the plugins to use.
 * It is used to automate the versioning and package publishing process. 
 * The configuration specifies that releases will be made from the 'main' branch and 
 * includes plugins for commit analysis, release notes generation, changelog updates, 
 * npm publishing, GitHub releases, and git commits.
 */
module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
