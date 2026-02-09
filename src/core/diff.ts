import type { FileMap } from './scanner.js';

export interface FileChange {
  path: string;
  localContent?: string;
  remoteContent?: string;
}

export interface SyncDiff {
  added: FileChange[];
  modified: FileChange[];
  removed: FileChange[];
  unchanged: FileChange[];
}

export function computeDiff(localFiles: FileMap, remoteFiles: FileMap): SyncDiff {
  const diff: SyncDiff = {
    added: [],
    modified: [],
    removed: [],
    unchanged: [],
  };

  // Files in local but not in remote (added)
  for (const [path, content] of localFiles) {
    if (!remoteFiles.has(path)) {
      diff.added.push({ path, localContent: content });
    }
  }

  // Files in both (modified or unchanged)
  for (const [path, localContent] of localFiles) {
    const remoteContent = remoteFiles.get(path);
    if (remoteContent !== undefined) {
      if (localContent === remoteContent) {
        diff.unchanged.push({ path, localContent, remoteContent });
      } else {
        diff.modified.push({ path, localContent, remoteContent });
      }
    }
  }

  // Files in remote but not in local (removed)
  for (const [path, content] of remoteFiles) {
    if (!localFiles.has(path)) {
      diff.removed.push({ path, remoteContent: content });
    }
  }

  return diff;
}

export function hasDifferences(diff: SyncDiff): boolean {
  return diff.added.length > 0 || diff.modified.length > 0 || diff.removed.length > 0;
}

export function diffSummary(diff: SyncDiff): string {
  const parts: string[] = [];
  if (diff.added.length > 0) parts.push(`${diff.added.length} added`);
  if (diff.modified.length > 0) parts.push(`${diff.modified.length} modified`);
  if (diff.removed.length > 0) parts.push(`${diff.removed.length} removed`);
  if (diff.unchanged.length > 0) parts.push(`${diff.unchanged.length} unchanged`);
  return parts.join(', ');
}
