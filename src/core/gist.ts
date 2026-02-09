import { GIST_API_BASE, META_FILENAME, VERSION } from '../utils/constants.js';
import { hostname } from 'node:os';

export interface GistFile {
  filename: string;
  content: string;
  truncated?: boolean;
  raw_url?: string;
}

export interface Gist {
  id: string;
  html_url: string;
  description: string;
  public: boolean;
  files: Record<string, GistFile>;
  created_at: string;
  updated_at: string;
  owner?: {
    login: string;
  };
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function buildMetaFile(): { content: string } {
  return {
    content: JSON.stringify(
      {
        version: '1.0.0',
        lastPush: new Date().toISOString(),
        lastPushMachine: hostname(),
        claudeSyncVersion: VERSION,
      },
      null,
      2,
    ),
  };
}

export async function createGist(
  token: string,
  files: Record<string, { content: string }>,
  options: { public: boolean } = { public: false },
): Promise<Gist> {
  const gistFiles = {
    ...files,
    [META_FILENAME]: buildMetaFile(),
  };

  const response = await fetch(`${GIST_API_BASE}/gists`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      description: 'Claude Code configuration (managed by claudesync)',
      public: options.public,
      files: gistFiles,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to create gist: ${response.status} ${response.statusText}\n${body}`);
  }

  return (await response.json()) as Gist;
}

export async function getGist(token: string, gistId: string): Promise<Gist> {
  const response = await fetch(`${GIST_API_BASE}/gists/${gistId}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Gist not found: ${gistId}. It may have been deleted.`);
    }
    throw new Error(`Failed to fetch gist: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as Gist;
}

export async function getPublicGist(gistId: string): Promise<Gist> {
  const response = await fetch(`${GIST_API_BASE}/gists/${gistId}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Gist not found: ${gistId}. It may be private or deleted.`);
    }
    throw new Error(`Failed to fetch gist: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as Gist;
}

export async function updateGist(
  token: string,
  gistId: string,
  files: Record<string, { content: string } | null>,
): Promise<Gist> {
  const gistFiles = {
    ...files,
    [META_FILENAME]: buildMetaFile(),
  };

  const response = await fetch(`${GIST_API_BASE}/gists/${gistId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ files: gistFiles }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to update gist: ${response.status} ${response.statusText}\n${body}`);
  }

  return (await response.json()) as Gist;
}

export function parseGistId(urlOrId: string): string {
  // If it's already a plain ID
  if (/^[a-f0-9]+$/.test(urlOrId)) {
    return urlOrId;
  }

  // Try to parse as URL
  try {
    const url = new URL(urlOrId);
    const parts = url.pathname.split('/').filter(Boolean);
    // URL format: gist.github.com/{user}/{id} or gist.github.com/{id}
    const id = parts[parts.length - 1];
    if (id && /^[a-f0-9]+$/.test(id)) {
      return id;
    }
  } catch {
    // Not a valid URL
  }

  throw new Error(
    `Invalid gist ID or URL: ${urlOrId}\nExpected a gist ID (hex string) or a gist.github.com URL.`,
  );
}
