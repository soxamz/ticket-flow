"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
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
    <div className="p-4">
      <Card className="mx-auto max-w-6xl shadow-lg">
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="text-sm">{summary}</div>
          <Button onClick={onAction} disabled={disabled || loading} size="lg">
            {loading ? "Please wait..." : actionLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
