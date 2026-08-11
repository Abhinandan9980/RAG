"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Blocks,
  Briefcase,
  ChevronsLeft,
  ChevronsRight,
  Code2,
  Database,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { JobCenter } from "@/components/layout/JobCenter";
import { ApplicationSwitcher } from "@/components/shell/ApplicationSwitcher";
import { AppearanceControl } from "@/components/theme/AppearanceControl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { coreStudioApps } from "@/lib/apps/coreStudios";
import type { AppManifest } from "@/lib/apps/types";
import type { CatalogState } from "@/lib/apps/useAppCatalog";
import {
  directApplicationRoute,
  presentationForApp,
} from "@/lib/presentation/registry";
import type { ApplicationPresentation } from "@/lib/presentation/types";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AdaptiveRailProps {
  catalog: CatalogState;
  pathname: string;
  presentation: ApplicationPresentation;
  expanded: boolean;
  onToggleExpanded: () => void;
}

const safeRoute = /^\/(?!\/)/;

function iconForApp(app: AppManifest): LucideIcon {
  switch (presentationForApp(app).id) {
    case "knowledge-studio":
      return MessageSquare;
    case "aurasql":
      return Database;
    case "analysis":
      return BarChart3;
    case "career-studio":
      return Briefcase;
    default:
      return Blocks;
  }
}

function RailLink({
  active,
  href,
  icon: Icon,
  label,
  expanded,
  layoutGroup,
}: {
  active: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
  expanded: boolean;
  layoutGroup: "desktop" | "mobile";
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={cn(
        "relative inline-flex h-10 shrink-0 items-center gap-3 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        expanded ? "w-full justify-start px-2.5" : "w-10 justify-center",
        active
          ? "text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      href={href}
      title={expanded ? undefined : label}
    >
      {active ? (
        <motion.span
          className="absolute inset-0 rounded-md bg-foreground"
          layoutId={`active-application-${layoutGroup}`}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
        />
      ) : null}
      <Icon aria-hidden="true" className="relative z-10 h-[18px] w-[18px] shrink-0" />
      {expanded ? (
        <span className="relative z-10 truncate text-sm font-medium">{label}</span>
      ) : null}
    </Link>
  );
}

function AccountControl({ expanded }: { expanded: boolean }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) {
    return (
      <button
        aria-label="Log in"
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-3 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          expanded ? "w-full justify-start px-2.5" : "w-10 justify-center",
        )}
        onClick={() => window.dispatchEvent(new CustomEvent("keystone:auth", { detail: { mode: "login" } }))}
        title={expanded ? undefined : "Log in"}
        type="button"
      >
        <LogIn aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
        {expanded ? <span className="truncate text-sm font-medium">Log in</span> : null}
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Open account menu for ${user.email}`}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-3 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            expanded ? "w-full justify-start px-2.5" : "w-10 justify-center",
          )}
          title={expanded ? undefined : "Account"}
          type="button"
        >
          <User aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
          {expanded ? <span className="truncate text-sm font-medium">{user.email}</span> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => {
            logout();
            router.push("/auth");
          }}
        >
          <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdaptiveRail({
  catalog,
  pathname,
  presentation,
  expanded,
  onToggleExpanded,
}: AdaptiveRailProps) {
  const applications =
    catalog.status === "success"
      ? coreStudioApps(catalog.apps.filter((app) => safeRoute.test(app.frontend_route)))
      : [];
  const activeApplication = applications.find(
    (app) => presentationForApp(app).id === presentation.id,
  );
  const compactControlClasses = expanded
    ? "[&_button]:h-10 [&_button]:w-full [&_button]:justify-start [&_button]:gap-3 [&_button]:px-2.5"
    : "[&_button]:h-10 [&_button]:w-10 [&_button]:p-0 [&_button>span]:hidden";

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-3 left-3 z-50 hidden flex-col rounded-md border border-border/70 bg-workspace-raised py-2 shadow-lg transition-[width] duration-200 md:flex",
          expanded ? "w-56 items-stretch px-2" : "w-14 items-center",
        )}
      >
        <nav
          aria-label="Applications"
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            expanded ? "items-stretch" : "items-center px-2",
          )}
        >
          <RailLink
            active={pathname === "/apps" || pathname.startsWith("/apps/")}
            href="/apps"
            icon={LayoutDashboard}
            label="Dashboard"
            expanded={expanded}
            layoutGroup="desktop"
          />
          <div
            aria-hidden="true"
            className={cn("my-1 h-px shrink-0 bg-border", expanded ? "w-full" : "w-7")}
          />
          {applications.map((app) => (
            <RailLink
              active={presentationForApp(app).id === presentation.id}
              href={directApplicationRoute(app)}
              icon={iconForApp(app)}
              key={app.id}
              label={app.name}
              expanded={expanded}
              layoutGroup="desktop"
            />
          ))}
        </nav>

        <div
          className={cn(
            "mt-2 flex shrink-0 flex-col gap-1",
            expanded ? "items-stretch" : "items-center px-2",
            compactControlClasses,
          )}
        >
          <JobCenter />
          <AppearanceControl />
          <RailLink
            active={pathname === "/developer"}
            href="/developer"
            icon={Code2}
            label="Developer"
            expanded={expanded}
            layoutGroup="desktop"
          />
          <AccountControl expanded={expanded} />
          <button
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-3 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              expanded ? "w-full justify-start px-2.5" : "w-10 justify-center",
            )}
            onClick={onToggleExpanded}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
            type="button"
          >
            {expanded ? (
              <ChevronsLeft aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <ChevronsRight aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
            )}
            {expanded ? <span className="truncate text-sm font-medium">Collapse</span> : null}
          </button>
        </div>
      </aside>

      <aside className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-workspace-raised pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_32px_-20px_hsl(var(--foreground)/0.35)] md:hidden">
        <nav
          aria-label="Mobile applications"
          className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center justify-items-center px-2"
        >
          <RailLink
            active={pathname === "/apps" || pathname.startsWith("/apps/")}
            href="/apps"
            icon={LayoutDashboard}
            label="Dashboard"
            expanded={false}
            layoutGroup="mobile"
          />
          <RailLink
            active={presentation.id !== "platform"}
            href={presentation.mainRoute}
            icon={activeApplication ? iconForApp(activeApplication) : Blocks}
            label={presentation.shortName}
            expanded={false}
            layoutGroup="mobile"
          />
          <ApplicationSwitcher
            activePresentation={presentation}
            catalog={catalog}
          />
          <div className="[&_button]:h-11 [&_button]:w-11 [&_button]:p-0 [&_button>span]:hidden [&>div>div]:bottom-full [&>div>div]:top-auto [&>div>div]:mb-2 [&>div>div]:mt-0">
            <JobCenter />
          </div>
          <AccountControl expanded={false} />
        </nav>
      </aside>
    </>
  );
}
