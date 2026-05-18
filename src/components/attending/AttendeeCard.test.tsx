import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TestApp } from '@/test/TestApp';
import { AttendeeCard } from './AttendeeCard';

const npub = 'npub1356jjqs745wr90x9acm8245qmvd6pg5asdvp964tg7gjwzaexw3sfjhc92';

describe('AttendeeCard', () => {
  it('renders an attendee with follow/message actions and toggles star', () => {
    const onToggleSave = vi.fn();
    render(
      <TestApp>
        <AttendeeCard npub={npub} saved={false} onToggleSave={onToggleSave} />
      </TestApp>,
    );

    // Name links to the Ditto profile, opening in a new tab / the Ditto app.
    const profile = screen.getByRole('link', { name: /View .* on Ditto/i });
    expect(profile).toHaveAttribute('href', `https://ditto.pub/${npub}`);
    expect(profile).toHaveAttribute('target', '_blank');
    expect(profile.getAttribute('rel') ?? '').toMatch(/noopener/);

    // Follow + Message actions present.
    expect(screen.getByRole('button', { name: /^Follow$/ })).toBeInTheDocument();
    const msg = screen.getByRole('link', { name: /Message/ });
    expect(msg).toHaveAttribute('href', `/messages?to=${npub}`);

    // Star toggles via callback.
    const star = screen.getByRole('button', { name: /Star /i });
    fireEvent.click(star);
    expect(onToggleSave).toHaveBeenCalledTimes(1);
  });
});
