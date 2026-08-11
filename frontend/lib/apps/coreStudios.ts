import type { AppManifest } from "@/lib/apps/types";

// The four real, user-facing studios (per PRODUCT.md: Chat, SQL, Analyst,
// Career). Developer and MCP Studio is an internal/dev tool already reachable
// from its own dedicated rail entry, and Presentation Studio has no distinct
// frontend surface yet — its manifest entry currently resolves to the same
// `/analysis` route as Data Analyst Studio. Filtering here (rather than at
// the catalog/provider level) keeps the raw backend catalog intact for
// anything else that reads it, while the dashboard and rail only ever
// present one entry per real screen.
const CORE_STUDIO_IDS = new Set(["knowledge-studio", "aurasql", "data-analyst", "career-studio"]);

export function coreStudioApps(apps: readonly AppManifest[]): AppManifest[] {
  const seenRoutes = new Set<string>();
  const result: AppManifest[] = [];
  for (const app of apps) {
    if (!CORE_STUDIO_IDS.has(app.id) || seenRoutes.has(app.frontend_route)) continue;
    seenRoutes.add(app.frontend_route);
    result.push(app);
  }
  return result;
}
