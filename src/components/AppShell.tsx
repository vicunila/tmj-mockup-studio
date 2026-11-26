import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
  AlertTriangle,
  ArrowLeft,
  Flag,
  MapPin,
  Route as RouteIcon,
  SlidersHorizontal,
} from "lucide-react";
import { useWay2fast } from "@/lib/way2fastContext";
import type { Language } from "@/data/i18n";

function getBackTarget(pathname: string): string | null {
  if (pathname === "/") return null;
  if (pathname === "/profile") return "/";
  if (pathname === "/destination") return "/profile";
  if (pathname === "/routes") return "/destination";
  if (pathname.startsWith("/route/")) return "/routes";
  if (pathname === "/report") return "/routes";
  if (pathname === "/report-status") return "/report";
  return "/";
}

function getActiveTab(pathname: string): string {
  if (pathname === "/profile") return "/profile";
  if (pathname === "/destination") return "/destination";
  if (pathname === "/routes" || pathname.startsWith("/route/")) return "/routes";
  if (pathname === "/report" || pathname === "/report-status") return "/report";
  return "";
}

export function AppShell({ children }: { children: ReactNode }) {
  const { lang, setLang, t, liveMessage } = useWay2fast();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const backTarget = getBackTarget(pathname);
  const showBottomNav = pathname !== "/";
  const activeTab = getActiveTab(pathname);

  const handleLangChange = (_: unknown, next: Language | null) => {
    if (next) setLang(next);
  };

  return (
    <div className="min-h-screen bg-canvas flex justify-center">
      <a href="#main-content" className="skip-link">
        {t.skipToContent}
      </a>

      <div className="flex min-h-screen w-full max-w-[430px] flex-col bg-background shadow-sm sm:border-x sm:border-border">
        <div className="sticky top-0 z-30 bg-background">
          {/* Persistent demo banner */}
          <div
            role="note"
            className="flex items-center justify-center gap-2 border-b-2 border-demo-border bg-demo-bg px-3 py-2 text-center text-xs font-bold text-demo-fg"
          >
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            <span>{t.demoBanner}</span>
          </div>

          {/* Top navigation bar */}
          <header className="flex min-h-14 items-center justify-between gap-2 border-b border-border bg-background px-3 py-1.5">
          <div className="flex items-center gap-1">
            {backTarget && (
              <IconButton
                aria-label={t.back}
                onClick={() => void navigate({ to: backTarget })}
                size="medium"
                color="inherit"
              >
                <ArrowLeft className="size-5 text-foreground" aria-hidden="true" />
              </IconButton>
            )}
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-1.5 text-base font-bold tracking-tight text-foreground no-underline"
            >
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                W2
              </span>
              <span>{t.appName}</span>
            </Link>
          </div>

          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={handleLangChange}
            aria-label={t.languageLabel}
            size="small"
          >
            <ToggleButton value="en" aria-label="English">
              EN
            </ToggleButton>
            <ToggleButton value="et" aria-label="Eesti keel">
              ET
            </ToggleButton>
          </ToggleButtonGroup>
        </header>
        </div>

        {/* Single primary landmark */}
        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 px-4 py-5 outline-none ${showBottomNav ? "pb-24" : "pb-8"}`}
        >
          {children}
        </main>

        {/* Bottom navigation for screens 2-7 */}
        {showBottomNav && (
          <nav
            aria-label="Primary"
            className="fixed bottom-0 z-20 w-full max-w-[430px] border-t border-border bg-background"
          >
            <BottomNavigation
              showLabels
              value={activeTab}
              onChange={(_, nextPath: string) => {
                void navigate({ to: nextPath });
              }}
            >
              <BottomNavigationAction
                label={t.nav.profile}
                value="/profile"
                icon={<SlidersHorizontal className="size-5" aria-hidden="true" />}
              />
              <BottomNavigationAction
                label={t.nav.destination}
                value="/destination"
                icon={<MapPin className="size-5" aria-hidden="true" />}
              />
              <BottomNavigationAction
                label={t.nav.routes}
                value="/routes"
                icon={<RouteIcon className="size-5" aria-hidden="true" />}
              />
              <BottomNavigationAction
                label={t.nav.report}
                value="/report"
                icon={<Flag className="size-5" aria-hidden="true" />}
              />
            </BottomNavigation>
          </nav>
        )}

        {/* Screen-reader live region for status updates */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>
      </div>
    </div>
  );
}