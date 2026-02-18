import { join } from 'node:path';
import { CLAUDE_DIR, SYNC_PATTERNS, EXCLUDE_PATTERNS, PATH_SEPARATOR, SENSITIVE_PATTERNS } from '../utils/constants.js';
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

/**
 * Redacts sensitive data from file content to prevent leaking secrets
 * when uploading to public gists
 */
export function redactSensitiveData(content: string, filename: string): { redacted: string; hadSensitiveData: boolean } {
  // Only apply sensitive data redaction to settings.json
  if (filename !== 'settings.json') {
    return { redacted: content, hadSensitiveData: false };
  }

  let hadSensitiveData = false;
  let redactedContent = content;

  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(redactedContent)) {
      hadSensitiveData = true;
      // Reset regex lastIndex since we're using global flag
      pattern.lastIndex = 0;

      // Replace with a placeholder
      redactedContent = redactedContent.replace(pattern, (match) => {
        // For JSON key-value pairs, keep the key but redact the value
        if (match.includes('": "') || match.includes("': '") || match.includes('": ')) {
          return match.replace(/: "[^"]*"/, ': "<REDACTED>"')
                      .replace(/: '[^']*'/, ': \'<REDACTED>\'')
                      .replace(/: [^:]*/, ': <REDACTED>');
        }
        // For environment variables
        if (match.includes('=')) {
          return match.split('=')[0] + '=<REDACTED>';
        }
        // For bare tokens/keys
        return '<REDACTED>';
      });
    }
    // Reset regex state
    pattern.lastIndex = 0;
  }

  return { redacted: redactedContent, hadSensitiveData };
}

export interface ScanResult {
  files: FileMap;
  hasSensitiveData: boolean;
}

export async function scanClaudeDir(): Promise<ScanResult> {
  const files = new Map<string, string>();
  let hasSensitiveData = false;

  if (!(await fileExists(CLAUDE_DIR))) {
    return { files, hasSensitiveData };
  }

  const allFiles = await listFiles(CLAUDE_DIR);

  for (const filePath of allFiles) {
    const normalized = filePath.replace(/\\/g, '/');
    if (shouldInclude(normalized)) {
      const fullPath = join(CLAUDE_DIR, filePath);
      try {
        let content = await readTextFile(fullPath);

        // Redact sensitive data from settings.json
        const { redacted, hadSensitiveData } = redactSensitiveData(content, normalized);
        if (hadSensitiveData) {
          hasSensitiveData = true;
        }

        files.set(normalized, redacted);
      } catch {
        // Skip unreadable files
      }
    }
  }

  return { files, hasSensitiveData };
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
    if (filename === '.claude-config-sync-meta.json') continue;
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
