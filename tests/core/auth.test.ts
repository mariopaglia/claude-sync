import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateToken } from '../../src/core/auth.js';

describe('auth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateToken', () => {
    it('returns user info on valid token', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ login: 'testuser', name: 'Test User' }),
      }));

      const user = await validateToken('valid-token');

      expect(user.login).toBe('testuser');
      expect(user.name).toBe('Test User');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        }),
      );
    });

    it('throws on 401 (invalid token)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      }));

      await expect(validateToken('bad-token')).rejects.toThrow('Invalid or expired');
    });

    it('throws on other API errors', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }));

      await expect(validateToken('token')).rejects.toThrow('GitHub API error: 500');
    });
  });
});
