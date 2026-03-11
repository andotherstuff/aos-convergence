#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { nip19 } from 'nostr-tools';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKER_DIR = path.resolve(__dirname, '..');
const DEFAULT_FILE = path.join(WORKER_DIR, 'approved_npubs.txt');

function usage() {
  console.error('Usage: node scripts/approved-npubs.mjs <check|list|csv|json> [--file <path>]');
}

function getFilePath(args) {
  const fileFlagIndex = args.indexOf('--file');
  if (fileFlagIndex === -1) return DEFAULT_FILE;
  const value = args[fileFlagIndex + 1];
  if (!value) {
    throw new Error('Missing value for --file');
  }
  return path.resolve(process.cwd(), value);
}

function parseNpubs(raw, sourcePath) {
  const lines = raw.split(/\r?\n/);
  const seen = new Set();
  const npubs = [];

  for (let i = 0; i < lines.length; i += 1) {
    const withoutComment = lines[i].split('#')[0].trim();
    if (!withoutComment) continue;

    if (seen.has(withoutComment)) continue;

    let decoded;
    try {
      decoded = nip19.decode(withoutComment);
    } catch {
      throw new Error(`Invalid bech32 string at ${sourcePath}:${i + 1}`);
    }

    if (decoded.type !== 'npub') {
      throw new Error(`Expected npub at ${sourcePath}:${i + 1}, got ${decoded.type}`);
    }

    seen.add(withoutComment);
    npubs.push(withoutComment);
  }

  return npubs;
}

function loadNpubs(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing ${filePath}. Create it (or copy approved_npubs.example.txt) and add one npub per line.`,
    );
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  return parseNpubs(raw, filePath);
}

function main() {
  const [, , command, ...rest] = process.argv;
  if (!command) {
    usage();
    process.exit(1);
  }

  if (!['check', 'list', 'csv', 'json'].includes(command)) {
    usage();
    process.exit(1);
  }

  const filePath = getFilePath(rest);
  const npubs = loadNpubs(filePath);

  if (command === 'check') {
    console.log(`OK: ${npubs.length} approved npub(s) in ${filePath}`);
    return;
  }

  if (command === 'list') {
    if (npubs.length === 0) {
      console.log('(empty)');
      return;
    }

    for (const npub of npubs) {
      console.log(npub);
    }
    return;
  }

  if (command === 'csv') {
    console.log(npubs.join(','));
    return;
  }

  console.log(JSON.stringify(npubs, null, 2));
}

try {
  main();
} catch (error) {
  console.error((error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
