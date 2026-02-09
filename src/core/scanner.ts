import { join, relative, sep } from 'node:path';
import { CLAUDE_DIR, SYNC_PATTERNS, EXCLUDE_PATTERNS, PATH_SEPARATOR } from '../utils/constants.js';
import { readTextFile, listFiles, fileExists } from '../utils/fs.js';

export interface FileEntry {
  relativePath: string;
  content: string;
}

export type FileMap = Map<string, string>;

function matchesPattern(filePath: string, pattern: string): boolean {
  // Normalize separators
  const normalized = filePath.replace(/\\/g, '/');

  // Convert glob pattern to regex
  const regexStr = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*\//g, '(.+/)?')
    .replace(/\*/g, '[^/]+');

  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(normalized);
}

function shouldInclude(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, '/');

  // Check exclusions first
  for (const pattern of EXCLUDE_PATTERNS) {
    if (matchesPattern(normalized, pattern)) {
      return false;
    }
  }

  // Check inclusions
  for (const pattern of SYNC_PATTERNS) {
    if (matchesPattern(normalized, pattern)) {
      return true;
    }
  }

  return false;
}

export async function scanClaudeDir(): Promise<FileMap> {
  const files = new Map<string, string>();

  if (!(await fileExists(CLAUDE_DIR))) {
    return files;
  }

  const allFiles = await listFiles(CLAUDE_DIR);

  for (const filePath of allFiles) {
    const normalized = filePath.replace(/\\/g, '/');
    if (shouldInclude(normalized)) {
      const fullPath = join(CLAUDE_DIR, filePath);
      try {
        const content = await readTextFile(fullPath);
        files.set(normalized, content);
      } catch {
        // Skip unreadable files
      }
    }
  }

  return files;
}

export function toGistFilename(relativePath: string): string {
  return relativePath.replace(/\//g, PATH_SEPARATOR);
}

export function fromGistFilename(gistFilename: string): string {
  // Split by __ and rejoin with /
  // Handle double underscores that are part of directory separators
  return gistFilename.split(PATH_SEPARATOR).join('/');
}

export function fileMapToGistFiles(
  fileMap: FileMap,
): Record<string, { content: string }> {
  const gistFiles: Record<string, { content: string }> = {};

  for (const [path, content] of fileMap) {
    const gistName = toGistFilename(path);
    gistFiles[gistName] = { content };
  }

  return gistFiles;
}

export function gistFilesToFileMap(
  gistFiles: Record<string, { content: string; filename?: string }>,
): FileMap {
  const fileMap = new Map<string, string>();

  for (const [filename, file] of Object.entries(gistFiles)) {
    if (filename === '.claudesync-meta.json') continue;
    const relativePath = fromGistFilename(filename);
    fileMap.set(relativePath, file.content);
  }

  return fileMap;
}

export function categorizeFiles(fileMap: FileMap): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    settings: [],
    memory: [],
    agents: [],
    skills: [],
    rules: [],
  };

  for (const path of fileMap.keys()) {
    if (path === 'settings.json' || path === 'keybindings.json') {
      categories.settings.push(path);
    } else if (path === 'CLAUDE.md') {
      categories.memory.push(path);
    } else if (path.startsWith('agents/')) {
      categories.agents.push(path);
    } else if (path.startsWith('skills/')) {
      categories.skills.push(path);
    } else if (path.startsWith('rules/')) {
      categories.rules.push(path);
    }
  }

  return categories;
}
