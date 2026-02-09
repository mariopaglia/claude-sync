import { loadConfig, saveConfig } from '../core/config.js';
import { getToken, validateToken } from '../core/auth.js';
import { getGist, parseGistId } from '../core/gist.js';
import { withSpinner } from '../ui/spinner.js';
import { log } from '../utils/logger.js';

export async function linkCommand(urlOrId: string): Promise<void> {
  const gistId = parseGistId(urlOrId);

  // Authenticate
  const token = await getToken();
  const user = await withSpinner('Validating token...', () => validateToken(token));

  // Validate gist exists
  const gist = await withSpinner('Checking gist...', () => getGist(token, gistId));

  // Save config (reload to get token if it was saved by getToken)
  const currentConfig = (await loadConfig()) ?? {};
  await saveConfig({
    ...currentConfig,
    gistId: gist.id,
    gistUrl: gist.html_url,
    username: user.login,
  });

  log.success(`Linked to gist: ${gist.html_url}`);
  log.dim('  Run `claude-sync pull` to download your config.');
}
