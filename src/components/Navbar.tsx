import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Search, LogOut, UserCircle, Shield, Mic2 } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useUserRoles } from "../hooks/use-roles";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const { isArtist, isAdmin, isSuperAdmin } = useUserRoles();

  const isAuth = useRouterState({ select: (s) => s.location.pathname }) === "/auth";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl h-16">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="Wesu+ home"
          >
            <img src={wesuLogo.url} alt="Wesu+" className="h-8 w-auto" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="bg-secondary/50 border border-input rounded-full pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-ring text-foreground placeholder:text-muted-foreground transition-colors"
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
                          {isSuperAdmin
                            ? "Superadmin"
                            : isAdmin
                              ? "Admin"
                              : isArtist
                                ? "Artist"
                                : "Listener"}
                        </p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Library
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      {!isArtist && (
                        <Link
                          to="/become-artist"
                          className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Mic2 className="size-4" /> Become an Artist
                          </span>
                        </Link>
                      )}
                      {isArtist && (
                        <Link
                          to="/artist-dashboard"
                          className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Mic2 className="size-4" /> Artist Portal
                          </span>
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Shield className="size-4" /> Admin
                          </span>
                        </Link>
                      )}
                      {isSuperAdmin && (
                        <Link
                          to="/superadmin"
                          className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Shield className="size-4 text-primary" /> Superadmin
                          </span>
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          setMenuOpen(false);
                          window.location.href = "/";
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-accent flex items-center gap-2 border-t border-border transition-colors"
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
                  className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
