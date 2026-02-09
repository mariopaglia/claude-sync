import { loadConfig, saveConfig } from '../core/config.js';
import { getToken, validateToken } from '../core/auth.js';
import { scanClaudeDir, fileMapToGistFiles, categorizeFiles } from '../core/scanner.js';
import { createGist } from '../core/gist.js';
import { confirmAction } from '../ui/prompts.js';
import { withSpinner } from '../ui/spinner.js';
import { log } from '../utils/logger.js';

export async function initCommand(): Promise<void> {
  // 1. Check if already initialized
  const existing = await loadConfig();
  if (existing?.gistId) {
    log.warn('Already initialized.');
    log.dim(`  Gist: ${existing.gistUrl ?? existing.gistId}`);
    log.dim('  Use `claude-sync push` or `claude-sync pull` to sync.');
    log.dim('  Use `claude-sync unlink` to reset.');
    return;
  }

  // 2. Authenticate
  const token = await getToken();
  const user = await withSpinner('Validating token...', () => validateToken(token));
  log.success(`Authenticated as ${user.login}`);

  // Reload config after auth (getToken may have saved the token)
  const currentConfig = await loadConfig();

  // 3. Scan local files
  const files = await withSpinner('Scanning ~/.claude/ ...', () => scanClaudeDir());

  if (files.size === 0) {
    log.warn('No syncable files found in ~/.claude/');
    log.dim('Make sure you have Claude Code configured before running init.');
    return;
  }

  // 4. Show summary
  const categories = categorizeFiles(files);
  console.log();
  log.info(`Found ${files.size} files to sync:`);
  if (categories.settings.length > 0) log.dim(`  Settings: ${categories.settings.join(', ')}`);
  if (categories.memory.length > 0) log.dim(`  Memory: ${categories.memory.join(', ')}`);
  if (categories.agents.length > 0) log.dim(`  Agents: ${categories.agents.length} files`);
  if (categories.skills.length > 0) log.dim(`  Skills: ${categories.skills.length} files`);
  if (categories.rules.length > 0) log.dim(`  Rules: ${categories.rules.length} files`);
  console.log();

  // 5. Confirm
  const proceed = await confirmAction('Create a secret gist to store your config?');
  if (!proceed) {
    log.dim('Cancelled.');
    return;
  }

  // 6. Create gist
  const gistFiles = fileMapToGistFiles(files);
  const gist = await withSpinner('Creating gist...', () => createGist(token, gistFiles));

  // 7. Save config (preserve token from currentConfig)
  await saveConfig({
    ...currentConfig,
    gistId: gist.id,
    gistUrl: gist.html_url,
    username: user.login,
    createdAt: new Date().toISOString(),
    lastPush: new Date().toISOString(),
  });

  // 8. Success
  console.log();
  log.success(`Initialized! Gist: ${gist.html_url}`);
  log.dim('  Run `claude-sync push` to upload changes.');
  log.dim('  Run `claude-sync pull` on another machine to sync.');
}
