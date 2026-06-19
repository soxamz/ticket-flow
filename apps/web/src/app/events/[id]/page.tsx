import { redirect } from "next/navigation";

type EventsAliasPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventsAliasPage({
  params,
}: EventsAliasPageProps) {
  const { id } = await params;
  redirect(`/dashboard/events/${id}`);
}
