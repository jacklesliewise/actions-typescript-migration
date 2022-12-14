import * as core from '@actions/core';
import * as github from '@actions/github';

import { createOrReplaceIssue } from './issue';
import { getTypeScriptMigrationStatus, getMarkdownTable } from './typescript-migration';

function run() {
  try {
    const baseBranch = core.getInput('base-branch');
    const sourceFolder = core.getInput('source-folder');
    const title = core.getInput('title');

    const octokit = github.getOctokit(process.env.GITHUB_TOKEN || '');

    console.log('> Calculating TypeScript migration status');
    const typeScriptMigrationStatus = getTypeScriptMigrationStatus(sourceFolder);
    console.log(typeScriptMigrationStatus);

    // TODO: revert
    if (github.context.ref !== `refs/heads/${baseBranch}`) {
      console.log('> Creating/updating bundle size issue');

      const markdownTable = getMarkdownTable(typeScriptMigrationStatus);
      void createOrReplaceIssue({ octokit, body: markdownTable, title });
    }
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
