import { CREATOR_PROFILE } from "@/lib/creator-profile";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function CinematicFooter() {
  return (
    <footer className="border-t border-border px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>Keystone — {CREATOR_PROFILE.name}</p>
        <div className="flex gap-6">
          {CREATOR_PROFILE.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`rounded-sm hover:text-foreground ${focusRing}`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
