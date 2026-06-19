import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reservation",
  description: "Confirm or cancel your reserved seats before time expires.",
};

export default function ReservationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
