import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TestApp } from '@/test/TestApp';
import { ProjectCard } from './ProjectCard';
import type { AttendeeProject, FoundryProject } from '@/hooks/useProjectDirectory';

const foundry: FoundryProject = {
  id: 'foundry-shakespeare',
  title: 'Shakespeare',
  description: 'An AI-first development platform built on Nostr.',
  site: 'https://shakespeare.diy',
  repo: 'https://gitlab.com/soapbox-pub/shakespeare',
  logo: '/logos/shakespeare.svg',
  tags: ['AI', 'Nostr'],
  source: 'foundry',
};

const attendeeDupe: AttendeeProject = {
  id: 'p_abc123',
  title: 'shakespeare.diy',
  website: ['https://shakespeare.diy'],
  github: [],
  other: [],
  source: 'attendee',
  suspectedDuplicateOf: 'foundry-shakespeare',
  duplicateOfTitle: 'Shakespeare',
};

describe('ProjectCard', () => {
  it('renders a Foundry project with description, tags and links', () => {
    render(
      <TestApp>
        <ProjectCard item={foundry} />
      </TestApp>,
    );
    expect(screen.getByText('Shakespeare')).toBeInTheDocument();
    expect(screen.getByText(/AI-first development platform/)).toBeInTheDocument();
    expect(screen.getByText('Foundry')).toBeInTheDocument();
    const site = screen.getByRole('link', { name: 'shakespeare.diy' });
    expect(site).toHaveAttribute('href', 'https://shakespeare.diy');
    expect(site).toHaveAttribute('target', '_blank');
    expect(site.getAttribute('rel') ?? '').toMatch(/noopener/);
  });

  it('flags a suspected duplicate attendee project', () => {
    render(
      <TestApp>
        <ProjectCard item={attendeeDupe} />
      </TestApp>,
    );
    expect(screen.getByText('Attendee')).toBeInTheDocument();
    expect(screen.getByText(/Possible duplicate of Foundry project/)).toHaveTextContent(
      'Shakespeare',
    );
  });
});
