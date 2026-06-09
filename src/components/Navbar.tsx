import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Search, Music } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/browse", label: "Browse" },
    { to: "/artists", label: "Artists" },
    { to: "/albums", label: "Albums" },
    { to: "/subscriptions", label: "Premium" },
  ];

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
          <Link
            to="/auth"
            className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:brightness-110 transition-all"
          >
            Sign In
          </Link>
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
        </div>
      )}
    </nav>
  );
}
