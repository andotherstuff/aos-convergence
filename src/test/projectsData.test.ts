import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The cleaned datasets are gitignored personal data (KV-only). These tests
// guard the build-*-data.py cleaning pipelines locally before upload, and are
// skipped where the local artifacts aren't present (e.g. CI).
const root = resolve(__dirname, '../../worker');
const projectsPath = resolve(root, 'projects-data.local.json');
const attendeesPath = resolve(root, 'attendees-data.local.json');

interface AttendeeProject {
  id: string;
  title: string;
  website: string[];
  github: string[];
  other: string[];
  source: string;
}

describe.skipIf(!existsSync(projectsPath))('attendee projects artifact', () => {
  const projects: AttendeeProject[] = JSON.parse(readFileSync(projectsPath, 'utf-8'));

  it('every project has an id, title and source=attendee', () => {
    expect(projects.length).toBeGreaterThan(20);
    for (const p of projects) {
      expect(p.id).toMatch(/^p_[0-9a-f]+$/);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.source).toBe('attendee');
      expect(p.website.length + p.github.length + p.other.length).toBeGreaterThan(0);
    }
  });

  it('only contains well-formed http(s) links', () => {
    for (const p of projects) {
      for (const url of [...p.website, ...p.github, ...p.other]) {
        expect(url).toMatch(/^https?:\/\/[^\s]+\.[^\s]+$/);
        expect(() => new URL(url)).not.toThrow();
      }
    }
  });
});

describe.skipIf(!existsSync(attendeesPath))('attendees artifact', () => {
  const attendees: { npub: string }[] = JSON.parse(readFileSync(attendeesPath, 'utf-8'));

  it('every entry is a valid, unique npub', () => {
    expect(attendees.length).toBeGreaterThan(50);
    for (const a of attendees) {
      expect(a.npub).toMatch(/^npub1[0-9a-z]+$/);
    }
    expect(new Set(attendees.map((a) => a.npub)).size).toBe(attendees.length);
  });
});
