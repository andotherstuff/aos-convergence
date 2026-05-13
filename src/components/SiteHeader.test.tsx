import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TestApp } from '@/test/TestApp';
import { SiteHeader } from './SiteHeader';
import { APP_URL } from '@/lib/appLinks';

describe('SiteHeader', () => {
  it('renders an "Open App" cross-link to the attendee app', () => {
    render(
      <TestApp>
        <SiteHeader />
      </TestApp>,
    );

    // There are two instances (desktop + mobile menu trigger), each accessible
    // by the same aria-label. Both should point to the configured APP_URL,
    // open in a new tab, and set rel="noopener noreferrer".
    const links = screen.getAllByLabelText(
      /open the aos convergence attendee app/i,
    );
    expect(links.length).toBeGreaterThanOrEqual(1);

    for (const link of links) {
      expect(link).toHaveAttribute('href', APP_URL);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel') ?? '').toMatch(/noopener/);
      expect(link.getAttribute('rel') ?? '').toMatch(/noreferrer/);
    }
  });
});
