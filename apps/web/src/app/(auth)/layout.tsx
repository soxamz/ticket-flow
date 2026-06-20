import { HexagonPattern } from "@repo/ui/components/hexagon-pattern";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8">
      <HexagonPattern
        hexagons={[
          [1, 1],
          [4, 4],
          [2, 2],
          [3, 4],
          [5, 4],
          [8, 2],
          [6, 3],
          [8, 5],
          [10, 10],
        ]}
        className={cn(
          "mask-[radial-gradient(420px_circle_at_center,white,transparent)]",
          "inset-0 skew-y-6 fill-primary/20 stroke-primary/20",
        )}
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-2">
        <Image
          src="/logo.svg"
          alt="TicketFlow"
          width={32}
          height={32}
          className="size-8"
        />
        {children}
      </div>
    </div>
  );
}
