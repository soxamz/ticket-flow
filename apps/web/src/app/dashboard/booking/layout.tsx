import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Booking",
  description: "View your confirmed booking and download your ticket.",
};

export default function BookingLayout({ children }: { children: ReactNode }) {
  return children;
}
