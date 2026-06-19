"use client";

import { cn } from "@repo/ui/lib/utils";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(
      0,
      Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
    ),
  );

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
      if (remaining === 0) {
        onExpire?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isUrgent = secondsLeft > 0 && secondsLeft <= 120;
  const isExpired = secondsLeft === 0;

  return (
    <div
      className={cn(
        "font-mono text-5xl font-bold tracking-widest",
        isExpired && "text-destructive",
        isUrgent && !isExpired && "text-destructive/80",
        !isUrgent && !isExpired && "text-primary",
      )}
    >
      {formatTime(secondsLeft)}
    </div>
  );
}
