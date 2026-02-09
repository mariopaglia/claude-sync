import { join } from 'node:path';
import { requireConfig, saveConfig } from '../core/config.js';
import { getToken } from '../core/auth.js';
import { scanClaudeDir, gistFilesToFileMap } from '../core/scanner.js';
import { getGist } from '../core/gist.js';
import { computeDiff, hasDifferences } from '../core/diff.js';
import { backupFile } from '../core/backup.js';
import { confirmAction, resolveConflict } from '../ui/prompts.js';
import { withSpinner } from '../ui/spinner.js';
import { showDiff, showPreview } from '../ui/diff-view.js';
import { log } from '../utils/logger.js';
import { CLAUDE_DIR } from '../utils/constants.js';
import { writeTextFile, removeFile } from '../utils/fs.js';

export async function pullCommand(options: { force?: boolean }): Promise<void> {
  // 1. Load config and token
  const config = await requireConfig();
  const token = await getToken();

  // 2. Fetch remote gist
  const gist = await withSpinner('Fetching remote gist...', () =>
    getGist(token, config.gistId!),
  );
  const remoteFiles = gistFilesToFileMap(gist.files);

  // 3. Scan local files
  const localFiles = await withSpinner('Scanning local files...', () => scanClaudeDir());

  // 4. Compute diff (remote vs local — remote is "source", local is "target")
  const diff = computeDiff(remoteFiles, localFiles);

  if (!hasDifferences(diff)) {
    log.success('Everything up to date.');
    return;
  }

  // Show summary
  console.log();
  log.info('Changes available from remote:');
  for (const file of diff.added) log.added(file.path);
  for (const file of diff.modified) log.modified(file.path);
  for (const file of diff.removed) log.removed(file.path);
  console.log();

  let pulled = 0;
  let skipped = 0;

  // 5. Handle new files (exist remotely, not locally)
  for (const file of diff.added) {
    console.log();
    log.info(`New file: ${file.path}`);
    showPreview(file.localContent!); // localContent is the remote content in this diff direction
    console.log();

    if (options.force || (await confirmAction(`Import ${file.path}?`))) {
      const destPath = join(CLAUDE_DIR, file.path);
      await writeTextFile(destPath, file.localContent!);
      pulled++;
    } else {
      skipped++;
    }
  }

  // 6. Handle modified files
  for (const file of diff.modified) {
    console.log();
    log.info(`Modified: ${file.path}`);
    showDiff(file.path, file.remoteContent!, file.localContent!);
    console.log();

    if (options.force) {
      const destPath = join(CLAUDE_DIR, file.path);
      await backupFile(destPath);
      await writeTextFile(destPath, file.localContent!);
      pulled++;
    } else {
      const resolution = await resolveConflict(file.path);
      if (resolution === 'remote') {
        const destPath = join(CLAUDE_DIR, file.path);
        await backupFile(destPath);
        await writeTextFile(destPath, file.localContent!);
        pulled++;
      } else if (resolution === 'local') {
        skipped++;
      } else {
        skipped++;
      }
    }
  }

  // 7. Handle deleted files (exist locally, not remotely)
  for (const file of diff.removed) {
    console.log();
    log.info(`File ${file.path} exists locally but not in remote.`);

    if (options.force) {
      skipped++; // Force mode does not delete local-only files
    } else {
      const resolution = await resolveConflict(file.path);
      if (resolution === 'remote') {
        const filePath = join(CLAUDE_DIR, file.path);
        await backupFile(filePath);
        await removeFile(filePath);
        pulled++;
      } else {
        skipped++;
      }
    }
  }

  // 8. Update config
  await saveConfig({
    ...config,
    lastPull: new Date().toISOString(),
  });

  console.log();
  log.success(`Pulled ${pulled} changes. ${skipped} skipped.`);
}
