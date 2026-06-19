import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type EventsAliasPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventsAliasPage({
  params,
}: EventsAliasPageProps) {
  const { id } = await params;
  redirect(`/dashboard/events/${id}`);
}
