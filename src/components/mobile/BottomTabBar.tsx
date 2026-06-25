import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Search, Library, User, Mic2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserRoles } from "@/hooks/use-roles";
import type { LucideIcon } from "lucide-react";

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
  ariaLabel: string;
  requireAuth?: boolean;
  show: boolean;
}

/** Pure function: compute tabs based on auth/role state. Exported for testing. */
export function computeTabs(opts: {
  isAuthenticated: boolean;
  isArtist: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}): Tab[] {
  const { isAuthenticated, isArtist, isAdmin, isSuperAdmin } = opts;
  return [
    {
      to: "/",
      label: "Home",
      icon: Home,
      ariaLabel: "Home",
      show: true,
    },
    {
      to: "/browse",
      label: "Browse",
      icon: Search,
      ariaLabel: "Browse music",
      show: true,
    },
    {
      to: "/dashboard",
      label: "Library",
      icon: Library,
      ariaLabel: "My library",
      requireAuth: true,
      show: true,
    },
    {
      to: "/profile",
      label: "Profile",
      icon: User,
      ariaLabel: "My profile",
      requireAuth: true,
      show: true,
    },
    {
      to: "/artist-studio",
      label: "Studio",
      icon: Mic2,
      ariaLabel: "Artist studio",
      show: isArtist || isAdmin || isSuperAdmin,
    },
    {
      to: isSuperAdmin ? "/superadmin" : "/admin",
      label: "Admin",
      icon: Shield,
      ariaLabel: "Admin panel",
      show: isAdmin || isSuperAdmin,
    },
  ].filter((t) => t.show);
}

export function BottomTabBar() {
  const { user } = useAuth();
  const { isArtist, isAdmin, isSuperAdmin } = useUserRoles();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const tabs = computeTabs({
    isAuthenticated: !!user,
    isArtist,
    isAdmin,
    isSuperAdmin,
  });

  function handleTab(tab: Tab) {
    if (tab.requireAuth && !user) {
      navigate({ to: "/auth" });
    } else {
      navigate({ to: tab.to as any });
    }
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-foreground/10 backdrop-blur-xl border-t border-border z-50 pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch h-14">
        {tabs.map((tab) => {
          const isActive = pathname === tab.to || (tab.to !== "/" && pathname.startsWith(tab.to));
          const Icon = tab.icon;
          return (
            <button
              key={tab.to}
              onClick={() => handleTab(tab)}
              aria-label={tab.ariaLabel}
              aria-current={isActive ? "page" : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
