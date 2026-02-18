import { requireConfig } from '../core/config.js';
import { getToken } from '../core/auth.js';
import { scanClaudeDir, gistFilesToFileMap } from '../core/scanner.js';
import { getGist } from '../core/gist.js';
import { computeDiff, hasDifferences } from '../core/diff.js';
import { withSpinner } from '../ui/spinner.js';
import { log } from '../utils/logger.js';
import { META_FILENAME } from '../utils/constants.js';

export async function statusCommand(): Promise<void> {
  // 1. Load config and token
  const config = await requireConfig();
  const token = await getToken();

  // 2. Fetch remote gist
  const gist = await withSpinner('Fetching remote gist...', () =>
    getGist(token, config.gistId!),
  );
  const remoteFiles = gistFilesToFileMap(gist.files);

  // 3. Scan local files
  const { files: localFiles } = await withSpinner('Scanning local files...', () => scanClaudeDir());

  // 4. Compute diff (local vs remote)
  const diff = computeDiff(localFiles, remoteFiles);

  // 5. Display status
  console.log();
  console.log('Local \u2194 Remote status:');
  console.log();

  for (const file of diff.unchanged) {
    log.synced(file.path);
  }
  for (const file of diff.modified) {
    log.modifiedStatus(file.path);
  }
  for (const file of diff.added) {
    log.localOnly(file.path);
  }
  for (const file of diff.removed) {
    log.remoteOnly(file.path);
  }

  console.log();

  if (!hasDifferences(diff)) {
    log.success('Everything in sync.');
  } else {
    const total = diff.added.length + diff.modified.length + diff.removed.length;
    log.info(`${total} files out of sync.`);
  }

  // 6. Show metadata
  const metaFile = gist.files[META_FILENAME];
  if (metaFile) {
    try {
      const meta = JSON.parse(metaFile.content);
      console.log();
      if (meta.lastPush) {
        log.dim(`  Last push: ${new Date(meta.lastPush).toLocaleString()} from ${meta.lastPushMachine ?? 'unknown'}`);
      }
    } catch {
      // ignore parse errors
    }
  }

  if (config.lastPull) {
    log.dim(`  Last pull: ${new Date(config.lastPull).toLocaleString()}`);
  }
}
