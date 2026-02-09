import { join } from 'node:path';
import { getPublicGist, parseGistId } from '../core/gist.js';
import { gistFilesToFileMap, categorizeFiles } from '../core/scanner.js';
import { backupFile } from '../core/backup.js';
import { confirmAction, selectMultiple } from '../ui/prompts.js';
import { withSpinner } from '../ui/spinner.js';
import { showDiff } from '../ui/diff-view.js';
import { log } from '../utils/logger.js';
import { CLAUDE_DIR } from '../utils/constants.js';
import { writeTextFile, readTextFile, fileExists } from '../utils/fs.js';

export async function importCommand(urlOrId: string): Promise<void> {
  // 1. Parse gist ID
  const gistId = parseGistId(urlOrId);

  // 2. Fetch gist (no auth needed for public gists)
  const gist = await withSpinner('Fetching gist...', () => getPublicGist(gistId));

  const owner = gist.owner?.login ?? 'unknown';
  const remoteFiles = gistFilesToFileMap(gist.files);

  if (remoteFiles.size === 0) {
    log.warn('No importable files found in this gist.');
    return;
  }

  // 3. Categorize and show available items
  const categories = categorizeFiles(remoteFiles);
  console.log();
  log.info(`Available items from @${owner}:`);
  console.log();

  const allPaths = Array.from(remoteFiles.keys());
  const choices = allPaths.map((path) => ({
    name: path,
    value: path,
    checked: true,
  }));

  const selected = await selectMultiple('Select items to import:', choices);

  if (selected.length === 0) {
    log.dim('No items selected. Cancelled.');
    return;
  }

  // 4. Import selected files
  let imported = 0;
  let skipped = 0;

  for (const path of selected) {
    const content = remoteFiles.get(path)!;
    const destPath = join(CLAUDE_DIR, path);

    if (await fileExists(destPath)) {
      // File exists locally — show diff and ask
      const localContent = await readTextFile(destPath);

      if (localContent === content) {
        log.dim(`  ${path} (identical, skipping)`);
        skipped++;
        continue;
      }

      console.log();
      log.info(`${path} already exists locally. Differences:`);
      showDiff(path, localContent, content);
      console.log();

      const overwrite = await confirmAction(`Overwrite ${path}?`, false);
      if (overwrite) {
        await backupFile(destPath);
        await writeTextFile(destPath, content);
        imported++;
      } else {
        skipped++;
      }
    } else {
      // New file — write directly
      await writeTextFile(destPath, content);
      imported++;
    }
  }

  console.log();
  log.success(`Imported ${imported} items from @${owner}. ${skipped} skipped.`);
}
