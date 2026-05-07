import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SiteNav() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="size-3 bg-primary rotate-45" /> AUTOCODE
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-mono uppercase">
          <Link to="/" className="hover:text-primary transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>Home</Link>
          <Link to="/portfolio" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>Portfolio</Link>
          <Link to="/announcements" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>News</Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && <span className="hidden sm:inline font-mono text-xs uppercase text-primary">Admin</span>}
              <Button size="sm" variant="outline" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>Sign out</Button>
            </>
          ) : (
            <Button asChild size="sm" variant="hero"><Link to="/auth">Sign in</Link></Button>
          )}
        </div>
      </div>
    </nav>
  );
}