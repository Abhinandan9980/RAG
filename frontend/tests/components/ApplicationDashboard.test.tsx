import { render, screen } from "@testing-library/react";

import { AppCatalog } from "@/components/platform/AppCatalog";
import type { AppManifest } from "@/lib/apps/types";
import { useAppCatalog } from "@/lib/apps/useAppCatalog";

vi.mock("@/lib/apps/useAppCatalog", () => ({ useAppCatalog: vi.fn() }));
vi.mock("@/hooks/useCinematicEffects", () => ({
  useCinematicEffects: () => ({ enabled: false, visible: true }),
}));
vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({ user: { id: 1, email: "demo@keystone.local" } }),
}));

const manifest = (
  id: string,
  name: string,
  frontendRoute: string,
  summary: string,
  category: string,
): AppManifest => ({
  id,
  name,
  frontend_route: frontendRoute,
  summary,
  category,
  version: "1",
  icon: "blocks",
  required_capabilities: [],
  optional_capabilities: [],
  backend_route_prefixes: [],
  backend_router_ids: [],
  required_permissions: [],
  required_env_keys: [],
  dependencies: [],
  demo_scenarios: [],
  health_check_id: id,
  packaging_paths: [],
});

const apps = [
  manifest("knowledge-studio", "Knowledge Studio", "/chat", "Ground every answer in evidence.", "knowledge"),
  manifest("aurasql", "AuraSQL", "/aurasql", "Query business data in plain language.", "data"),
];

it("renders every studio as a direct, one-click link to its route", () => {
  vi.mocked(useAppCatalog).mockReturnValue({
    status: "success",
    error: null,
    retry: vi.fn(),
    apps,
  });

  render(<AppCatalog />);

  expect(screen.getByRole("link", { name: "Open Knowledge Studio" })).toHaveAttribute("href", "/chat");
  expect(screen.getByRole("link", { name: "Open AuraSQL" })).toHaveAttribute("href", "/aurasql");
  expect(screen.getByRole("main", { name: "Application dashboard" })).toBeInTheDocument();
  expect(screen.queryByText(/guided scenarios/i)).not.toBeInTheDocument();
});

it("offers one retry without exposing transport parsing details", () => {
  vi.mocked(useAppCatalog).mockReturnValue({
    status: "error",
    apps: [],
    error: new Error('Unexpected token "<"'),
    retry: vi.fn(),
  });

  render(<AppCatalog />);

  expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  expect(screen.queryByText(/unexpected token/i)).not.toBeInTheDocument();
});
