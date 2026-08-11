import { AuthController } from "@/components/auth/AuthController";
import { CinematicFaq } from "@/components/flagship-cinema/CinematicFaq";
import { CinematicFooter } from "@/components/flagship-cinema/CinematicFooter";
import { CinematicHeader } from "@/components/flagship-cinema/CinematicHeader";
import { CinematicManifesto } from "@/components/flagship-cinema/CinematicManifesto";
import { CinematicProof } from "@/components/flagship-cinema/CinematicProof";
import { CinematicSequence } from "@/components/flagship-cinema/CinematicSequence";

export const metadata = {
  title: "Keystone — Triangulation (experimental landing)",
};

export default function CinematicLandingPage({
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
      <CinematicHeader />
      <AuthController initialMode={initialMode} />
      <main>
        <CinematicSequence />
        <CinematicProof />
        <CinematicManifesto />
        <CinematicFaq />
      </main>
      <CinematicFooter />
    </div>
  );
}
