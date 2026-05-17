import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLoggedInAccounts } from '@/hooks/useLoggedInAccounts';
import { useLoginActions } from '@/hooks/useLoginActions';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { currentUser } = useLoggedInAccounts();
  const { logout } = useLoginActions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(222,219,213,0.9)]" style={{ backdropFilter: 'blur(14px)', background: 'rgba(251, 250, 248, 0.92)' }}>
      <div className="w-full max-w-[1120px] mx-auto px-6 max-[720px]:px-4">
        <nav className="flex items-center justify-between py-3 gap-6 max-[720px]:py-[0.65rem]" aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-[0.7rem] no-underline text-inherit">
            <div
              className="w-10 h-10 rounded-[12px] overflow-hidden flex items-center justify-center border border-[rgba(0,0,0,0.06)]"
              style={{ background: '#f2f1f0', boxShadow: '0 8px 18px rgba(0, 0, 0, 0.06)' }}
              aria-hidden="true"
            >
              <img src="/AOS_Official.svg" alt="AOS logo" className="w-full h-full block" />
            </div>
            <div className="flex flex-col gap-[0.1rem]">
              <span className="text-[0.82rem] tracking-[0.12em] uppercase text-[#716f6a] max-[720px]:text-[0.75rem]">
                And Other Stuff
              </span>
              <span className="text-[1.02rem] font-semibold tracking-[0.03em] text-[#0f100f] max-[720px]:text-[0.95rem]">
                Technology for Human Thriving
              </span>
            </div>
          </Link>
          {/* Desktop nav */}
          <div className="hidden min-[721px]:flex items-center gap-[1.4rem] text-[0.9rem] text-[#716f6a]">
            <NavLink to="/" active={isHome}>Home</NavLink>
            <NavLink to="/about" active={location.pathname === '/about'}>About</NavLink>
            <NavLink to="/program" active={location.pathname === '/program'}>Program</NavLink>
            {currentUser && <NavLink to="/admin" active={location.pathname === '/admin'}>Admin</NavLink>}
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-[0.9rem] text-[#716f6a] hover:text-[#0f100f] p-0 h-auto font-normal"
              >
                Log out
              </Button>
            )}
          </div>
          {/* Mobile hamburger button */}
          <button
            className="min-[721px]:hidden flex items-center justify-center w-9 h-9 text-[#716f6a] hover:text-[#0f100f] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </nav>
      </div>
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="min-[721px]:hidden border-t border-[rgba(222,219,213,0.9)]" style={{ background: 'rgba(251, 250, 248, 0.98)' }}>
          <div className="w-full max-w-[1120px] mx-auto px-6 max-[720px]:px-4 py-4 flex flex-col gap-3 text-[0.9rem] text-[#716f6a]">
            <MobileNavLink to="/" active={isHome}>Home</MobileNavLink>
            <MobileNavLink to="/about" active={location.pathname === '/about'}>About</MobileNavLink>
            <MobileNavLink to="/program" active={location.pathname === '/program'}>Program</MobileNavLink>
            {currentUser && <MobileNavLink to="/admin" active={location.pathname === '/admin'}>Admin</MobileNavLink>}
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-[0.9rem] text-[#716f6a] hover:text-[#0f100f] p-0 h-auto font-normal w-fit"
              >
                Log out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      to={to}
      className="relative pb-[0.1rem] group"
      style={{ color: active ? '#0f100f' : undefined }}
    >
      {children}
      <span
        className="absolute left-0 -bottom-[0.15rem] h-[1.5px] bg-[#0f100f] transition-[width] duration-200 ease-out group-hover:w-full"
        style={{ width: active ? '100%' : '0' }}
      />
    </Link>
  );
}

function MobileNavLink({ to, children, active }: { to: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      to={to}
      className="py-1 transition-colors no-underline"
      style={{ color: active ? '#0f100f' : '#716f6a' }}
    >
      {children}
    </Link>
  );
}
