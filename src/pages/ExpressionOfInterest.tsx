import { useState, type FormEvent } from 'react';
import { useSeoMeta } from '@unhead/react';
import { SiteLayout } from '@/components/SiteLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mnjgpgjb';

const ExpressionOfInterest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useSeoMeta({
    title: 'Expression of Interest — AOS Convergence Oslo',
    description: 'Apply to attend AOS Convergence Oslo 2026. Space is extremely limited.',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Collect checkbox values for "current stage"
    const stages: string[] = [];
    form.querySelectorAll<HTMLInputElement>('input[name="current_stage"]:checked').forEach((cb) => {
      stages.push(cb.value);
    });
    formData.delete('current_stage');
    formData.append('current_stage', stages.join(', '));

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <SiteLayout>
        <div className="max-w-[640px] mx-auto px-6 py-20 md:py-28 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Thank you</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your expression of interest has been received. Our team will review your submission
            and you'll hear back from us by email. If approved, you'll receive an invitation
            with full event details.
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-[640px] mx-auto px-6 py-16 md:py-24">
        <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
          AOS Convergence — Oslo (May 2026)
        </span>
        <h1 className="text-[clamp(1.5rem,2.5vw+1rem,2.2rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground mb-4">
          Apply to Attend
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground mb-3">
          We are hosting a small, invitation-only gathering in Oslo for builders, researchers, funders, and community
          leaders actively working on decentralized, open-source technologies that expand and enhance human thriving.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground mb-10">
          Please complete and submit the form below to apply to attend.
        </p>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* 1. Basic Information */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-foreground mb-1">1. Basic Information</legend>
            <FormGroup label="Name or nym" required>
              <Input name="full_name" required className="rounded-[10px]" />
            </FormGroup>
            <FormGroup label="Email address" required>
              <Input name="email" type="email" required className="rounded-[10px]" />
            </FormGroup>
            <FormGroup label="Nostr npub">
              <Input name="nostr_npub" placeholder="npub1..." className="rounded-[10px]" />
            </FormGroup>
            <FormGroup label="Location (City / Country)">
              <Input name="location" className="rounded-[10px]" />
            </FormGroup>
          </fieldset>

          {/* 2. What Are You Building */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-foreground mb-1">2. What Are You Building or Working On?</legend>
            <p className="text-sm text-muted-foreground">
              In 3–5 sentences: What are you currently building, researching, or supporting?
              How does it relate to freedom tech?
            </p>
            <Textarea
              name="what_building"
              required
              rows={5}
              className="rounded-[10px]"
            />
          </fieldset>

          {/* 3. Why AOS */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-foreground mb-1">3. Why And Other Stuff?</legend>
            <p className="text-sm text-muted-foreground">
              What specifically draws you to <a href="https://andotherstuff.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">And Other Stuff</a>?
            </p>
            <Textarea
              name="why_aos"
              required
              rows={4}
              className="rounded-[10px]"
            />
          </fieldset>

          {/* 4. Contribution */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-foreground mb-1">4. Contribution</legend>
            <p className="text-sm text-muted-foreground mb-2">
              If invited, what would you hope to contribute? Examples:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside mb-3 space-y-1">
              <li>A product demo</li>
              <li>A research insight</li>
              <li>A hard problem you want help thinking through</li>
              <li>A collaboration proposal</li>
              <li>Infrastructure or funding support</li>
              <li>Governance experimentation</li>
              <li>Good energy and thoughtful conversation</li>
              <li>Something else</li>
            </ul>
            <Textarea
              name="contribution"
              required
              rows={4}
              className="rounded-[10px]"
            />
          </fieldset>

          {/* 5. Current Stage */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-foreground mb-1">5. Current Stage</legend>
            <p className="text-sm text-muted-foreground mb-3">
              Which best describes your current focus? (Select all that apply)
            </p>
            <div className="space-y-2.5">
              {[
                'Idea stage',
                'Prototype / MVP',
                'Active product with users',
                'Research project',
                'Funding / ecosystem support',
                'Community organizing',
              ].map((stage) => (
                <label key={stage} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="current_stage"
                    value={stage}
                    className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground"
                  />
                  <span className="text-sm text-foreground">{stage}</span>
                </label>
              ))}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    name="current_stage"
                    value="Other"
                    className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground"
                  />
                  <span className="text-sm text-foreground">Other:</span>
                </label>
                <Input name="current_stage_other" placeholder="Please specify" className="rounded-[10px] flex-1" />
              </div>
            </div>
          </fieldset>

          {/* 6. Alignment */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-foreground mb-1">6. Alignment</legend>
            <div className="text-sm text-muted-foreground space-y-2 mb-3">
              <p>AOS is focused on:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Open protocols over platforms</li>
                <li>Expanding human agency</li>
                <li>Building tools that protect freedom of speech, assembly, and transaction</li>
                <li>Shipping real products (not just theory)</li>
              </ul>
              <p>In 2–4 sentences: How does your work align with these principles?</p>
            </div>
            <Textarea
              name="alignment"
              required
              rows={4}
              className="rounded-[10px]"
            />
          </fieldset>

          {/* 7. Skin in the Game */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-foreground mb-1">7. Skin in the Game</legend>
            <div className="text-sm text-muted-foreground space-y-2 mb-3">
              <p>Have you:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Contributed to open-source projects?</li>
                <li>Run or funded a project in this space?</li>
                <li>Operated infrastructure?</li>
                <li>Shipped a product?</li>
                <li>Published research?</li>
                <li>Built a community?</li>
              </ul>
              <p>Briefly describe your relevant experience.</p>
            </div>
            <Textarea
              name="skin_in_game"
              required
              rows={4}
              className="rounded-[10px]"
            />
          </fieldset>

          {/* 8. Hard Problem */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-foreground mb-1">8. What Hard Problem(s) Are You Obsessed With?</legend>
            <p className="text-sm text-muted-foreground mb-3">
              We are particularly interested in people wrestling with non-trivial challenges.
              What problem in decentralized or freedom tech do you believe is misunderstood, underexplored, or unsolved?
            </p>
            <Textarea
              name="hard_problem"
              required
              rows={4}
              className="rounded-[10px]"
            />
          </fieldset>

          {/* 9. Links */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-foreground mb-1">9. Links</legend>
            <p className="text-sm text-muted-foreground mb-3">
              Share anything relevant — website, GitHub, Nostr profile, Twitter/X, whitepaper, etc.
            </p>
            <FormGroup label="Website">
              <Input name="link_website" type="url" placeholder="https://" className="rounded-[10px]" />
            </FormGroup>
            <FormGroup label="GitHub">
              <Input name="link_github" placeholder="https://github.com/..." className="rounded-[10px]" />
            </FormGroup>
            <FormGroup label="Nostr profile">
              <Input name="link_nostr" placeholder="npub1... or nprofile1..." className="rounded-[10px]" />
            </FormGroup>
            <FormGroup label="Twitter / X">
              <Input name="link_twitter" placeholder="https://x.com/..." className="rounded-[10px]" />
            </FormGroup>
            <FormGroup label="Whitepaper or other links">
              <Input name="link_other" placeholder="https://" className="rounded-[10px]" />
            </FormGroup>
          </fieldset>

          {/* Privacy + HRF opt-in */}
          <div className="bg-secondary rounded-[18px] p-5 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your submission will be reviewed by the organizing team and will not be shared publicly.
              If accepted, you will receive an invitation by email. If not selected, you will be notified as well.
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="hrf_opt_in"
                value="yes"
                className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground mt-0.5"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I also permit my submission to be shared with the{' '}
                <a href="https://hrf.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80 transition-colors">Human Rights Foundation</a>,
                a sponsor of AOS Convergence, which is offering accepted participants a complimentary{' '}
                <a href="https://hrf.org/latest/the-oslo-freedom-forum-returns-june-1-3-2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80 transition-colors">Oslo Freedom Forum</a>{' '}
                pass (subject to HRF approval).
              </span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </div>
    </SiteLayout>
  );
};

function FormGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground block">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default ExpressionOfInterest;
