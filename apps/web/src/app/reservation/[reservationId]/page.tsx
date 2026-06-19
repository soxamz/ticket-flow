import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type ReservationAliasPageProps = {
  params: Promise<{ reservationId: string }>;
  searchParams: Promise<{ expiresAt?: string }>;
};

export default async function ReservationAliasPage({
  params,
  searchParams,
}: ReservationAliasPageProps) {
  const { reservationId } = await params;
  const { expiresAt } = await searchParams;
  const query = expiresAt ? `?expiresAt=${encodeURIComponent(expiresAt)}` : "";
  redirect(`/dashboard/reservation/${reservationId}${query}`);
}
