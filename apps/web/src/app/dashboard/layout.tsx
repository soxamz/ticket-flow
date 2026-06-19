import { AppHeader } from "@/components/AppHeader";
import { AuthGuard } from "@/components/AuthGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">{children}</main>
    </AuthGuard>
  );
}
