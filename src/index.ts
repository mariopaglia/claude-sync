import { Command } from 'commander';
import { VERSION } from './utils/constants.js';
import { log } from './utils/logger.js';

const program = new Command();

program
  .name('claude-config-sync')
  .description('Sync your Claude Code configuration across machines using GitHub Gists')
  .version(VERSION);

program
  .command('init')
  .description('Initialize sync — create a new gist to store your config')
  .action(async () => {
    try {
      const { initCommand } = await import('./commands/init.js');
      await initCommand();
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  });

program
  .command('push')
  .description('Push local config to remote gist')
  .option('-f, --force', 'Push without confirmation')
  .action(async (options) => {
    try {
      const { pushCommand } = await import('./commands/push.js');
      await pushCommand(options);
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  });

program
  .command('pull')
  .description('Pull remote config to local machine')
  .option('-f, --force', 'Pull without confirmation (still creates backups)')
  .action(async (options) => {
    try {
      const { pullCommand } = await import('./commands/pull.js');
      await pullCommand(options);
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show sync status — diff between local and remote')
  .action(async () => {
    try {
      const { statusCommand } = await import('./commands/status.js');
      await statusCommand();
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  });

program
  .command('share')
  .description('Create a public gist to share your config with others')
  .action(async () => {
    try {
      const { shareCommand } = await import('./commands/share.js');
      await shareCommand();
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  });

program
  .command('import <url-or-id>')
  .description('Import config from a shared gist (selective)')
  .action(async (urlOrId) => {
    try {
      const { importCommand } = await import('./commands/import.js');
      await importCommand(urlOrId);
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  });

program
  .command('link <gist-id>')
  .description('Link to an existing gist on a new machine')
  .action(async (gistId) => {
    try {
      const { linkCommand } = await import('./commands/link.js');
      await linkCommand(gistId);
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  });

program
  .command('unlink')
  .description('Remove local link to gist (gist is NOT deleted)')
  .action(async () => {
    try {
      const { unlinkCommand } = await import('./commands/unlink.js');
      await unlinkCommand();
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  });

program.parse();
