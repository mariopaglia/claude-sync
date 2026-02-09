import { loadConfig, removeConfig } from '../core/config.js';
import { confirmAction } from '../ui/prompts.js';
import { log } from '../utils/logger.js';

export async function unlinkCommand(): Promise<void> {
  const config = await loadConfig();

  if (!config?.gistId) {
    log.warn('Not currently linked to any gist.');
    return;
  }

  log.info(`Currently linked to: ${config.gistUrl ?? config.gistId}`);
  const proceed = await confirmAction(
    'Unlink from gist? (local config stays, gist is NOT deleted)',
  );

  if (!proceed) {
    log.dim('Cancelled.');
    return;
  }

  await removeConfig();
  log.success('Unlinked. Run `claudesync init` or `claudesync link` to reconnect.');
}
