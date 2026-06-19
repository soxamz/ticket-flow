import { redirect } from "next/navigation";

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
