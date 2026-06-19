import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type BookingAliasPageProps = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ expired?: string }>;
};

export default async function BookingAliasPage({
  params,
  searchParams,
}: BookingAliasPageProps) {
  const { bookingId } = await params;
  const { expired } = await searchParams;
  const query = expired ? `?expired=${encodeURIComponent(expired)}` : "";
  redirect(`/dashboard/booking/${bookingId}${query}`);
}
