import { execSync } from 'child_process';

export function ensureGitWorkspace(logger) {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  } catch {
    logger.error('Not a git repository. Please run inside a git workspace.');
    process.exit(3);
  }
}

export function getDiff(logger) {
  try {
    const diff = execSync('git diff --cached', { encoding: 'utf-8' });
    return diff;
  } catch (error) {
    logger.error('Failed to read staged git diff:', error);
    process.exit(4);
  }
}

export function commitChanges(message, logger) {
  try {
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    logger.info('Committed!');
  } catch (error) {
    logger.error('Failed to commit changes:', error);
    process.exit(6);
  }
}