import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppearanceProvider, useAppearance } from "@/components/theme/AppearanceProvider";
import { AppearanceControl } from "@/components/theme/AppearanceControl";

function Probe() {
  const appearance = useAppearance();
  return <output>{appearance.theme}</output>;
}

describe("AppearanceProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to dark before any preference is stored", () => {
    render(<AppearanceProvider><Probe /></AppearanceProvider>);
    expect(screen.getByText("dark")).toBeInTheDocument();
  });

  it("lets the user flip to light with a single click", async () => {
    render(<AppearanceProvider><AppearanceControl /><Probe /></AppearanceProvider>);
    await userEvent.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(screen.getByText("light")).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("toggles back to dark on a second click", async () => {
    render(<AppearanceProvider><AppearanceControl /><Probe /></AppearanceProvider>);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    await userEvent.click(button);
    await userEvent.click(button);
    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
  });
});
