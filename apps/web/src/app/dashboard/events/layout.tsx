import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Event details",
  description: "Review event information and reserve your seats.",
};

export default function EventsLayout({ children }: { children: ReactNode }) {
  return children;
}
