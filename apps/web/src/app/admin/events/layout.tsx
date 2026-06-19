import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Manage events",
  description: "Create, edit, and inspect event bookings.",
};

export default function AdminEventsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
