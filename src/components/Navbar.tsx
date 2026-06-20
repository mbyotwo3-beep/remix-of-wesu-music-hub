import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Search, Music, LogOut, UserCircle, Shield, Mic2 } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useUserRoles } from "../hooks/use-roles";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const { isArtist, isAdmin, isSuperAdmin } = useUserRoles();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/browse", label: "Browse" },
    { to: "/artists", label: "Artists" },
    { to: "/albums", label: "Albums" },
    { to: "/subscriptions", label: "Premium" },
  ];

  const isAuth = pathname === "/auth";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
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
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search songs, artists..."
              className="bg-secondary border border-border rounded-full pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <ThemeToggle />

          {!loading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-foreground"
                    aria-label="Open user menu"
                  >
                    <UserCircle className="size-7" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <p className="text-xs font-semibold text-primary mt-0.5">
                          {isSuperAdmin ? "Superadmin" : isAdmin ? "Admin" : isArtist ? "Artist" : "Listener"}
                        </p>
                      </div>
                      <Link to="/dashboard" className="block px-4 py-2.5 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                        My Library
                      </Link>
                      <Link to="/profile" className="block px-4 py-2.5 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                        Profile
                      </Link>
                      {!isArtist && (
                        <Link to="/become-artist" className="block px-4 py-2.5 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                          <span className="inline-flex items-center gap-2"><Mic2 className="size-4" /> Become an Artist</span>
                        </Link>
                      )}
                      {isArtist && (
                        <Link to="/artist-dashboard" className="block px-4 py-2.5 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                          <span className="inline-flex items-center gap-2"><Mic2 className="size-4" /> Artist Portal</span>
                        </Link>
                      )}
                      {isAdmin && (
                        <Link to="/admin" className="block px-4 py-2.5 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                          <span className="inline-flex items-center gap-2"><Shield className="size-4" /> Admin</span>
                        </Link>
                      )}
                      {isSuperAdmin && (
                        <Link to="/superadmin" className="block px-4 py-2.5 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                          <span className="inline-flex items-center gap-2"><Shield className="size-4 text-primary" /> Superadmin</span>
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          setMenuOpen(false);
                          window.location.href = "/";
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-accent flex items-center gap-2 border-t border-border"
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
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border px-6 py-4 space-y-3 bg-background">
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
                My Library
              </Link>
              {isArtist && (
                <Link to="/artist-dashboard" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  Artist Portal
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  Admin
                </Link>
              )}
              {isSuperAdmin && (
                <Link to="/superadmin" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  Superadmin
                </Link>
              )}
              <button
                onClick={() => { supabase.auth.signOut(); window.location.href = "/"; }}
                className="block text-sm font-medium text-destructive"
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
