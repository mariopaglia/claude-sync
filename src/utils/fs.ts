import { readFile, writeFile, mkdir, access, readdir, unlink, stat } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function readTextFile(path: string): Promise<string> {
  return readFile(path, 'utf-8');
}

export async function writeTextFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path));
  await writeFile(path, content, 'utf-8');
}

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function listFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true, recursive: true });
    return entries.filter((e) => e.isFile()).map((e) => {
      const parent = e.parentPath ?? e.path;
      return parent === dir ? e.name : `${parent.slice(dir.length + 1)}/${e.name}`;
    });
  } catch {
    return [];
  }
}

export async function removeFile(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch {
    // ignore if file doesn't exist
  }
}

export async function getFileStats(path: string) {
  try {
    return await stat(path);
  } catch {
    return null;
  }
}
