import chalk from 'chalk';

export const log = {
  info(message: string) {
    console.log(chalk.blue('i'), message);
  },

  success(message: string) {
    console.log(chalk.green('✓'), message);
  },

  warn(message: string) {
    console.log(chalk.yellow('!'), message);
  },

  error(message: string) {
    console.error(chalk.red('✗'), message);
  },

  dim(message: string) {
    console.log(chalk.dim(message));
  },

  added(filename: string) {
    console.log(chalk.green(`  + Added:    ${filename}`));
  },

  modified(filename: string) {
    console.log(chalk.yellow(`  ✎ Modified: ${filename}`));
  },

  removed(filename: string) {
    console.log(chalk.red(`  - Removed:  ${filename}`));
  },

  synced(filename: string) {
    console.log(chalk.dim(`  ✓ ${filename}`) + chalk.dim(' (in sync)'));
  },

  localOnly(filename: string) {
    console.log(chalk.green(`  + ${filename}`) + chalk.dim(' (local only)'));
  },

  remoteOnly(filename: string) {
    console.log(chalk.red(`  - ${filename}`) + chalk.dim(' (remote only)'));
  },

  modifiedStatus(filename: string) {
    console.log(chalk.yellow(`  ✎ ${filename}`) + chalk.dim(' (modified locally)'));
  },
};
