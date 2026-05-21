import type { NostrSigner } from '@nostrify/types';

const EXTENSION_WAIT_TIMEOUT_MS = 2500;
const EXTENSION_WAIT_INTERVAL_MS = 100;

function getWindowSigner(): NostrSigner | undefined {
  return (globalThis as { nostr?: NostrSigner }).nostr;
}

export function hasNostrExtension(): boolean {
  return !!getWindowSigner();
}

export async function waitForNostrExtension(options?: {
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<NostrSigner> {
  const timeoutMs = options?.timeoutMs ?? EXTENSION_WAIT_TIMEOUT_MS;
  const intervalMs = options?.intervalMs ?? EXTENSION_WAIT_INTERVAL_MS;

  const signer = getWindowSigner();
  if (signer) {
    return signer;
  }

  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => globalThis.setTimeout(resolve, intervalMs));

    const nextSigner = getWindowSigner();
    if (nextSigner) {
      return nextSigner;
    }
  }

  throw new Error('Nostr extension is not available');
}

export function formatExtensionLoginError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Extension login failed';
  const normalized = message.toLowerCase();

  if (
    normalized.includes('not available') ||
    normalized.includes('not found') ||
    normalized.includes('no nostr')
  ) {
    return 'No Nostr signer was detected. If you are using Soapbox Signer, make sure it is installed, unlocked, and allowed on this site, then try again. Amber on Android should use the remote signer option with a bunker:// URI.';
  }

  if (
    normalized.includes('denied') ||
    normalized.includes('rejected') ||
    normalized.includes('user aborted') ||
    normalized.includes('cancel')
  ) {
    return 'The signer request was not approved. Approve the request in your signer and try again.';
  }

  return message;
}

export function formatNip98SigningError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Failed to sign HTTP auth event';
  const normalized = message.toLowerCase();

  if (
    normalized.includes('denied') ||
    normalized.includes('rejected') ||
    normalized.includes('user aborted') ||
    normalized.includes('cancel')
  ) {
    return 'Your signer did not approve the HTTP auth request needed to verify event access. Approve kind 27235 for this site and try again.';
  }

  if (
    normalized.includes('not available') ||
    normalized.includes('not found') ||
    normalized.includes('browser extension not available')
  ) {
    return 'Your signer was no longer available when the site tried to verify access. Reconnect your signer and try again.';
  }

  return `Could not complete the signer request needed to verify access: ${message}`;
}
