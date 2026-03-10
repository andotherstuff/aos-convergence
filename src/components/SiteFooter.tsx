import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="border-t border-[#dedbd5] py-6 pb-[1.8rem] mt-auto text-[0.8rem] text-[#716f6a] max-[720px]:py-5 max-[720px]:pb-6" style={{ background: '#fbfaf8' }}>
      <div className="w-full max-w-[1120px] mx-auto px-6 max-[720px]:px-4">
        <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:justify-between min-[720px]:items-center">
          <div>
            <a
              href="https://github.com/andotherstuff"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[0.35rem] text-[#716f6a] hover:text-[#0f100f] transition-colors no-underline"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              Open Source
            </a>
          </div>
          <div className="flex flex-wrap gap-[0.85rem]">
            <Link to="/" className="text-[#716f6a] hover:text-[#0f100f] no-underline transition-colors">Home</Link>
            <Link to="/interest" className="text-[#716f6a] hover:text-[#0f100f] no-underline transition-colors">Apply to Attend</Link>
            <a href="https://andotherstuff.org" target="_blank" rel="noopener noreferrer" className="text-[#716f6a] hover:text-[#0f100f] no-underline transition-colors">
              andotherstuff.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
