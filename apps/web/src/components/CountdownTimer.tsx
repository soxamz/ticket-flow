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
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    function update() {
      setReduceMotion(mediaQuery.matches);
    }
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

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
  const label = isExpired
    ? "Reservation expired"
    : `Time remaining: ${formatTime(secondsLeft)}`;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={label}
      className={cn(
        "font-mono text-5xl font-bold tabular-nums tracking-widest motion-safe:transition-colors",
        isExpired && "text-destructive",
        isUrgent && !isExpired && "text-destructive/80",
        !isUrgent && !isExpired && "text-primary",
        reduceMotion && isUrgent && !isExpired && "animate-pulse",
      )}
    >
      {formatTime(secondsLeft)}
    </div>
  );
}
