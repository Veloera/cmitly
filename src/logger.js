import chalk from 'chalk';

class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
  }

  info(...args) {
    console.log(chalk.blue('info'), ...args);
  }

  warn(...args) {
    console.warn(chalk.yellow('warn'), ...args);
  }

  error(...args) {
    console.error(chalk.red('error'), ...args);
  }

  debug(...args) {
    if (this.verbose) {
      console.log(chalk.gray('debug'), ...args);
    }
  }
}

export default Logger;