import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Users",
  description: "View accounts and adjust admin access.",
};

export default function AdminUsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
