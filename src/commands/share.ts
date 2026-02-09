import { getToken } from '../core/auth.js';
import { scanClaudeDir, fileMapToGistFiles, categorizeFiles } from '../core/scanner.js';
import { createGist } from '../core/gist.js';
import { confirmAction, selectMultiple } from '../ui/prompts.js';
import { withSpinner } from '../ui/spinner.js';
import { log } from '../utils/logger.js';

export async function shareCommand(): Promise<void> {
  // 1. Authenticate
  const token = await getToken();

  // 2. Scan local files
  const files = await withSpinner('Scanning local files...', () => scanClaudeDir());

  if (files.size === 0) {
    log.warn('No syncable files found in ~/.claude/');
    return;
  }

  // 3. Let user select files to share
  const allPaths = Array.from(files.keys());
  const categories = categorizeFiles(files);

  const choices = allPaths.map((path) => ({
    name: path,
    value: path,
    checked: true,
  }));

  console.log();
  log.warn('This creates a PUBLIC gist. Make sure no sensitive data is included.');
  console.log();

  const selected = await selectMultiple('Select files to share:', choices);

  if (selected.length === 0) {
    log.dim('No files selected. Cancelled.');
    return;
  }

  // 4. Confirm
  console.log();
  log.info(`Sharing ${selected.length} files publicly.`);
  const proceed = await confirmAction('Continue?');
  if (!proceed) {
    log.dim('Cancelled.');
    return;
  }

  // 5. Build file map with only selected files
  const selectedFiles = new Map<string, string>();
  for (const path of selected) {
    const content = files.get(path);
    if (content) selectedFiles.set(path, content);
  }

  // 6. Create public gist
  const gistFiles = fileMapToGistFiles(selectedFiles);
  const gist = await withSpinner('Creating public gist...', () =>
    createGist(token, gistFiles, { public: true }),
  );

  // 7. Success
  console.log();
  log.success('Shared! Anyone can import with:');
  console.log();
  console.log(`  claudesync import ${gist.html_url}`);
  console.log();
}
