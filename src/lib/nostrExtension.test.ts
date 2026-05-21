import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { formatExtensionLoginError, formatNip98SigningError, hasNostrExtension, waitForNostrExtension } from './nostrExtension';

describe('nostrExtension helpers', () => {
  beforeEach(() => {
    delete (globalThis as { nostr?: unknown }).nostr;
  });

  afterEach(() => {
    delete (globalThis as { nostr?: unknown }).nostr;
    vi.useRealTimers();
  });

  test('detects available signer', () => {
    (globalThis as { nostr?: unknown }).nostr = { getPublicKey: vi.fn() };
    expect(hasNostrExtension()).toBe(true);
  });

  test('waits for delayed signer injection', async () => {
    vi.useFakeTimers();

    const pending = waitForNostrExtension({ timeoutMs: 500, intervalMs: 50 });

    vi.advanceTimersByTime(100);
    (globalThis as { nostr?: unknown }).nostr = { getPublicKey: vi.fn() };
    vi.advanceTimersByTime(50);

    await expect(pending).resolves.toEqual((globalThis as { nostr?: unknown }).nostr);
  });

  test('times out when no signer is injected', async () => {
    vi.useFakeTimers();

    const pending = waitForNostrExtension({ timeoutMs: 100, intervalMs: 50 });
    vi.advanceTimersByTime(150);

    await expect(pending).rejects.toThrow('Nostr extension is not available');
  });

  test('formats extension detection errors', () => {
    const message = formatExtensionLoginError(new Error('Nostr extension is not available'));
    expect(message).toContain('Soapbox Signer');
    expect(message).toContain('bunker://');
  });

  test('formats NIP-98 signer approval errors', () => {
    const message = formatNip98SigningError(new Error('User rejected request'));
    expect(message).toContain('kind 27235');
  });
});
