import { requireConfig, saveConfig } from '../core/config.js';
import { getToken } from '../core/auth.js';
import { scanClaudeDir, fileMapToGistFiles, gistFilesToFileMap, toGistFilename } from '../core/scanner.js';
import { getGist, updateGist } from '../core/gist.js';
import { computeDiff, hasDifferences } from '../core/diff.js';
import { confirmAction } from '../ui/prompts.js';
import { withSpinner } from '../ui/spinner.js';
import { log } from '../utils/logger.js';

export async function pushCommand(options: { force?: boolean }): Promise<void> {
  // 1. Load config and token
  const config = await requireConfig();
  const token = await getToken();

  // 2. Scan local files
  const localFiles = await withSpinner('Scanning local files...', () => scanClaudeDir());

  // 3. Fetch remote gist
  const gist = await withSpinner('Fetching remote gist...', () =>
    getGist(token, config.gistId!),
  );
  const remoteFiles = gistFilesToFileMap(gist.files);

  // 4. Compute diff
  const diff = computeDiff(localFiles, remoteFiles);

  if (!hasDifferences(diff)) {
    log.success('Everything up to date.');
    return;
  }

  // 5. Show summary
  console.log();
  log.info('Changes to push:');
  for (const file of diff.added) log.added(file.path);
  for (const file of diff.modified) log.modified(file.path);
  for (const file of diff.removed) log.removed(file.path);
  console.log();

  // 6. Confirm
  if (!options.force) {
    const proceed = await confirmAction('Push these changes?');
    if (!proceed) {
      log.dim('Cancelled.');
      return;
    }
  }

  // 7. Build update payload
  const updateFiles: Record<string, { content: string } | null> = {};

  // Add modified and new files
  for (const file of [...diff.added, ...diff.modified]) {
    updateFiles[toGistFilename(file.path)] = { content: file.localContent! };
  }

  // Remove deleted files (null signals deletion in Gist API)
  for (const file of diff.removed) {
    updateFiles[toGistFilename(file.path)] = null;
  }

  // 8. Update gist
  await withSpinner('Pushing changes...', () =>
    updateGist(token, config.gistId!, updateFiles),
  );

  // 9. Update config
  await saveConfig({
    ...config,
    lastPush: new Date().toISOString(),
  });

  const totalChanges = diff.added.length + diff.modified.length + diff.removed.length;
  log.success(`Pushed ${totalChanges} changes to gist.`);
}
