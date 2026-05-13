import { describe, it, expect, beforeEach } from 'vitest';
import { clearTokens, getAccessToken, setTokens } from './client';

describe('api client tokens', () => {
  beforeEach(() => {
    clearTokens();
  });

  it('stores and reads access token', () => {
    setTokens({ access_token: 'abc', refresh_token: 'def' });
    expect(getAccessToken()).toBe('abc');
  });
});
