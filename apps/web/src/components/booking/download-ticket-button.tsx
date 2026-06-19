"use client";

import { Button } from "@repo/ui/components/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BEARER_TOKEN_KEY } from "@/lib/auth-client";

interface DownloadTicketButtonProps {
  bookingId: string;
}

export function DownloadTicketButton({ bookingId }: DownloadTicketButtonProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(BEARER_TOKEN_KEY)
        : null;

    if (!token) {
      toast.error("Sign in required", {
        description: "Sign in again to download your ticket.",
      });
      return;
    }

    setDownloading(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/ticket`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to generate ticket PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticketflow-${bookingId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed", {
        description: "Try again in a moment or refresh the page.",
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="flex-1"
      disabled={downloading}
      onClick={handleDownload}
    >
      <Download className="size-4" aria-hidden />
      {downloading ? "Preparing…" : "Download ticket"}
    </Button>
  );
}
