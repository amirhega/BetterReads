import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SearchBar } from '@/components/search/SearchBar';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-surface-raised border-b border-surface-overlay sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-accent-primary font-bold text-xl font-display">
              BetterReads
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg hidden sm:block">
            <SearchBar />
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/library"
                  className="text-text-secondary hover:text-text-primary text-sm hidden md:block"
                >
                  Library
                </Link>
                <Link
                  to="/diary"
                  className="text-text-secondary hover:text-text-primary text-sm hidden md:block"
                >
                  Diary
                </Link>
                <Link
                  to="/rankings"
                  className="text-text-secondary hover:text-text-primary text-sm hidden md:block"
                >
                  Rankings
                </Link>
                <Link
                  to="/stats"
                  className="text-text-secondary hover:text-text-primary text-sm hidden lg:block"
                >
                  Stats
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-8 h-8 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center text-sm font-bold"
                  >
                    {profile?.username?.[0]?.toUpperCase() ?? 'U'}
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-10 bg-surface-overlay border border-surface-input rounded-lg shadow-xl py-2 w-48 z-50">
                      <Link
                        to={`/user/${profile?.username}`}
                        className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                        onClick={() => setShowMenu(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/lists"
                        className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                        onClick={() => setShowMenu(false)}
                      >
                        Lists
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                        onClick={() => setShowMenu(false)}
                      >
                        Settings
                      </Link>
                      <div className="border-t border-surface-input my-1" />
                      <button
                        onClick={() => {
                          signOut();
                          setShowMenu(false);
                          navigate('/');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-text-primary text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-accent-primary text-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
