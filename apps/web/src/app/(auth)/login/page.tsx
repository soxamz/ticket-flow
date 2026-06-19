import { LoginView } from "@/components/auth/login-view";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8 text-muted-foreground">Loading...</div>}>
      <LoginView />
    </Suspense>
  );
}
