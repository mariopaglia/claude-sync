import { join, basename } from 'node:path';
import { readdir, unlink, copyFile } from 'node:fs/promises';
import { BACKUPS_DIR, MAX_BACKUPS_PER_FILE } from '../utils/constants.js';
import { ensureDir, fileExists } from '../utils/fs.js';

function backupName(filePath: string): string {
  const name = filePath.replace(/\//g, '__');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${timestamp}_${name}`;
}

export async function backupFile(sourcePath: string): Promise<string | null> {
  if (!(await fileExists(sourcePath))) {
    return null;
  }

  await ensureDir(BACKUPS_DIR);

  const destName = backupName(
    sourcePath.includes('.claude/')
      ? sourcePath.split('.claude/')[1]
      : basename(sourcePath),
  );
  const destPath = join(BACKUPS_DIR, destName);

  await copyFile(sourcePath, destPath);

  // Rotate old backups for this file
  await rotateBackups(sourcePath);

  return destPath;
}

async function rotateBackups(originalPath: string): Promise<void> {
  const fileIdentifier = originalPath.includes('.claude/')
    ? originalPath.split('.claude/')[1].replace(/\//g, '__')
    : basename(originalPath);

  try {
    const entries = await readdir(BACKUPS_DIR);
    const related = entries
      .filter((e) => e.endsWith(`_${fileIdentifier}`))
      .sort()
      .reverse();

    // Remove oldest backups beyond the limit
    const toRemove = related.slice(MAX_BACKUPS_PER_FILE);
    for (const file of toRemove) {
      await unlink(join(BACKUPS_DIR, file));
    }
  } catch {
    // Ignore rotation errors
  }
}
