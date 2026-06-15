import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/', label: 'Arena Board' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/fixtures', label: 'Fixtures' },
  { to: '/results', label: 'Results' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/players', label: 'Players' }
];

const dashboardPath = (user) => {
  if (!user) return '/login';
  if (user.role === 'admin') return '/admin';
  if (user.role === 'moderator') return '/moderator/ongoing';
  return '/dashboard';
};

const PublicLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinkClass = ({ isActive }) => (
    `px-3 py-2 text-sm font-bold rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-text hover:bg-base2'}`
  );

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-40 border-b border-base2 bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-9 w-9 rounded-lg" />
            <span className="brand-premium text-xl">Cue Arena</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-base2 text-text hover:border-primary hover:text-primary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to={dashboardPath(user)} className="aura-btn px-4 py-2 text-xs">
              {user ? 'Dashboard' : 'Login'}
            </Link>
            {!user && (
              <Link to="/register" className="btn-outline px-4 py-2 text-xs">
                Register
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-base2 lg:hidden"
            aria-label="Open menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-base2 bg-surface px-4 py-3 lg:hidden">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={toggleTheme} className="btn-outline flex-1 px-4 py-2 text-xs">
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
                <Link to={dashboardPath(user)} onClick={() => setOpen(false)} className="aura-btn flex-1 px-4 py-2 text-center text-xs">
                  {user ? 'Dashboard' : 'Login'}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-base2 bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
          <p className="font-bold text-text-emphasis">Cue Arena</p>
          <p>Public competitions, live fixtures, rankings, and results for cue sports.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
