"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { RainbowButton } from "@repo/ui/components/rainbow-button";
import type { ReactNode } from "react";

interface StickyActionBarProps {
  summary: ReactNode;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function StickyActionBar({
  summary,
  actionLabel,
  onAction,
  disabled = false,
  loading = false,
}: StickyActionBarProps) {
  return (
    <Card className="border-primary/20 bg-linear-to-r from-primary/15 via-card to-violet-950/30 shadow-lg">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="text-sm">{summary}</div>
        <RainbowButton
          onClick={onAction}
          disabled={disabled || loading}
          size="lg"
        >
          {loading ? "Please wait…" : actionLabel}
        </RainbowButton>
      </CardContent>
    </Card>
  );
}
