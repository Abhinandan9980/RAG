"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AuthController } from "@/components/auth/AuthController";
import { AmbientTerrainBackdrop } from "@/components/flagship-terrain/AmbientTerrainBackdrop";
import { CinematicBackdrop } from "@/components/cinematic/CinematicBackdrop";
import { MotionRoute } from "@/components/motion/MotionRoute";
import { AdaptiveRail } from "@/components/shell/AdaptiveRail";
import { LocalSubmenu } from "@/components/shell/LocalSubmenu";
import { useSidebarExpanded } from "@/hooks/useSidebarExpanded";
import type { CatalogState } from "@/lib/apps/useAppCatalog";
import { presentationForPath } from "@/lib/presentation/registry";
import { cn } from "@/lib/utils";

interface CinematicAppShellProps {
  catalog: CatalogState;
  children: ReactNode;
}

export function CinematicAppShell({
  catalog,
  children,
}: CinematicAppShellProps) {
  const pathname = usePathname() || "/apps";
  const presentation = presentationForPath(pathname);
  const { expanded, toggle } = useSidebarExpanded();

  return (
    <div className="relative isolate min-h-screen text-foreground">
      {presentation.id === "platform" ? (
        <AmbientTerrainBackdrop />
      ) : (
        <CinematicBackdrop media={presentation.media} />
      )}
      <AuthController />
      <AdaptiveRail
        catalog={catalog}
        pathname={pathname}
        presentation={presentation}
        expanded={expanded}
        onToggleExpanded={toggle}
      />
      <div className="min-h-screen pb-16 md:pb-0">
        <LocalSubmenu pathname={pathname} presentation={presentation} expanded={expanded} />
        <div
          data-testid="shell-content"
          className={cn("min-w-0", expanded ? "md:pl-64" : "md:pl-20")}
        >
          <MotionRoute routeKey={pathname}>{children}</MotionRoute>
        </div>
      </div>
    </div>
  );
}
