#!/usr/bin/env node

import { execSync } from 'child_process';
import { Command } from 'commander';
import inquirer from 'inquirer';
import Logger from '../src/logger.js';
import { initConfig, ensureInitialized, loadConfig } from '../src/config.js';
import { ensureGitWorkspace, getDiff, commitChanges } from '../src/git.js';
import { loadSystemPrompt } from '../src/prompt.js';
import { generateCommit } from '../src/api.js';

(async () => {
  const program = new Command();
  program
    .name('cmitly')
    .description('Commit message generator following Conventional Commits')
    .version('1.0.0')
    .option('--verbose', 'Enable debug logging', false);

  program
    .command('init')
    .description('Initialize Cmitly configuration')
    .action(async () => {
      const options = program.opts();
      const logger = new Logger(options.verbose);
      await initConfig(logger);
    });

  program
    .action(async () => {
      const options = program.opts();
      const logger = new Logger(options.verbose);
      try {
        ensureInitialized(logger);
        ensureGitWorkspace(logger);
        const config = loadConfig(logger);
        logger.debug('Loaded config:', config);
        let diff = getDiff(logger);
        logger.debug('Git diff:', diff);
        if (!diff.trim()) {
          const { stageAll } = await inquirer.prompt({
            name: 'stageAll',
            type: 'confirm',
            message: 'No staged changes detected. Stage all changes and continue?',
            default: true
          });
          if (!stageAll) {
            logger.warn('Commit aborted.');
            process.exit(0);
          }
          execSync('git add -A', { stdio: 'inherit' });
          diff = getDiff(logger);
          logger.debug('Git diff after staging:', diff);
          if (!diff.trim()) {
            logger.info('No changes to commit after staging.');
            process.exit(0);
          }
        }
        if (!diff.trim()) {
          logger.info('No changes detected.');
          process.exit(0);
        }
        const systemPrompt = loadSystemPrompt(logger);
        logger.info('Generating commit message...');
        const message = await generateCommit(diff, config, systemPrompt, logger);
        console.log('\n' + message + '\n');
        const { confirm } = await inquirer.prompt({
          name: 'confirm',
          type: 'confirm',
          message: 'Do you accept this commit message?',
          default: true
        });
        if (confirm) {
          commitChanges(message, logger);
        } else {
          logger.warn('Commit aborted.');
        }
      } catch (error) {
        logger.error('Unexpected error:', error);
        process.exit(1);
      }
    });

  program.parse(process.argv);
})();
