import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Search, Music, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/browse", label: "Browse" },
    { to: "/artists", label: "Artists" },
    { to: "/albums", label: "Albums" },
    { to: "/subscriptions", label: "Premium" },
  ];

  const isAuth = pathname === "/auth";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-obsidian/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-bold text-xl tracking-tighter text-primary flex items-center gap-2">
            <Music className="size-5" />
            WESU+
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeProps={{ className: "text-foreground" }}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search songs, artists..."
              className="bg-secondary/50 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {!loading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-foreground"
                  >
                    <UserCircle className="size-6" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                      <Link to="/dashboard" className="block px-4 py-2.5 text-sm hover:bg-white/5" onClick={() => setMenuOpen(false)}>
                        Dashboard
                      </Link>
                      <Link to="/artist-dashboard" className="block px-4 py-2.5 text-sm hover:bg-white/5" onClick={() => setMenuOpen(false)}>
                        Artist Portal
                      </Link>
                      <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          setMenuOpen(false);
                          window.location.href = "/";
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                      >
                        <LogOut className="size-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : !isAuth ? (
                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:brightness-110 transition-all"
                >
                  Sign In
                </Link>
              ) : null}
            </>
          )}

          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 px-6 py-4 space-y-3 bg-obsidian/95">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link to="/dashboard" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <button
                onClick={() => { supabase.auth.signOut(); window.location.href = "/"; }}
                className="block text-sm font-medium text-red-400"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
