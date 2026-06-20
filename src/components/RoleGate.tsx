import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useUserRoles, type AppRole } from "@/hooks/use-roles";
import { Shield } from "lucide-react";

interface Props {
  require: "user" | "artist" | "admin" | "superadmin";
  children: ReactNode;
}

export function RoleGate({ require, children }: Props) {
  const { isUser, isArtist, isAdmin, isSuperAdmin, loading } = useUserRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isUser) navigate({ to: "/auth" });
  }, [loading, isUser, navigate]);

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading…</div>;
  if (!isUser) return null;

  const ok =
    require === "user" ? true :
    require === "artist" ? isArtist || isAdmin || isSuperAdmin :
    require === "admin" ? isAdmin :
    require === "superadmin" ? isSuperAdmin :
    false;

  if (!ok) {
    return (
      <div className="max-w-md mx-auto p-12 text-center">
        <Shield className="size-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-xl font-bold mb-2">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          You need the <span className="font-semibold text-foreground">{require}</span> role to view this page.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

export type { AppRole };
