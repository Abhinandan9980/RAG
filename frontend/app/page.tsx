import { AuthController } from "@/components/auth/AuthController";
import { PublicFooter } from "@/components/flagship/PublicFooter";
import { PublicHeader } from "@/components/flagship/PublicHeader";
import { TerrainSequence } from "@/components/flagship-terrain/TerrainSequence";

export default function FlagshipPage({
  searchParams,
}: {
  searchParams?: { auth?: string };
}) {
  const initialMode =
    searchParams?.auth === "register"
      ? "register"
      : searchParams?.auth === "login"
        ? "login"
        : undefined;
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <PublicHeader />
      <AuthController initialMode={initialMode} />
      <main>
        <TerrainSequence />
      </main>
      <PublicFooter />
    </div>
  );
}
