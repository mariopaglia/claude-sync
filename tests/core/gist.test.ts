import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseGistId } from '../../src/core/gist.js';

describe('gist', () => {
  describe('parseGistId', () => {
    it('returns plain hex ID as-is', () => {
      expect(parseGistId('abc123def456')).toBe('abc123def456');
    });

    it('extracts ID from gist URL with username', () => {
      expect(parseGistId('https://gist.github.com/user/abc123def456')).toBe('abc123def456');
    });

    it('extracts ID from gist URL without username', () => {
      expect(parseGistId('https://gist.github.com/abc123def456')).toBe('abc123def456');
    });

    it('throws on invalid input', () => {
      expect(() => parseGistId('not-a-valid-id')).toThrow('Invalid gist ID or URL');
    });

    it('throws on URL with non-hex ID', () => {
      expect(() => parseGistId('https://gist.github.com/user/not-hex')).toThrow(
        'Invalid gist ID or URL',
      );
    });
  });
});

describe('gist API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('createGist sends correct request', async () => {
    const mockResponse = {
      id: 'abc123',
      html_url: 'https://gist.github.com/user/abc123',
      description: 'test',
      public: false,
      files: {},
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const { createGist } = await import('../../src/core/gist.js');
    const result = await createGist('test-token', { 'test.md': { content: '# Test' } });

    expect(result.id).toBe('abc123');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/gists'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('getGist fetches a gist by ID', async () => {
    const mockGist = {
      id: 'abc123',
      html_url: 'https://gist.github.com/user/abc123',
      description: 'test',
      public: false,
      files: { 'test.md': { content: '# Test', filename: 'test.md' } },
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGist),
    }));

    const { getGist } = await import('../../src/core/gist.js');
    const result = await getGist('test-token', 'abc123');

    expect(result.id).toBe('abc123');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/gists/abc123'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('getGist throws on 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }));

    const { getGist } = await import('../../src/core/gist.js');
    await expect(getGist('test-token', 'nonexistent')).rejects.toThrow('Gist not found');
  });

  it('updateGist sends PATCH request', async () => {
    const mockResponse = {
      id: 'abc123',
      html_url: 'https://gist.github.com/user/abc123',
      description: 'test',
      public: false,
      files: {},
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const { updateGist } = await import('../../src/core/gist.js');
    await updateGist('test-token', 'abc123', {
      'test.md': { content: '# Updated' },
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/gists/abc123'),
      expect.objectContaining({
        method: 'PATCH',
      }),
    );
  });
});
