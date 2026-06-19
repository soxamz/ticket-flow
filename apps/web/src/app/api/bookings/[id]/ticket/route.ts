import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import type { BookingDetail } from "@repo/types";
import { NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { TicketDocument } from "@/components/pdf/ticket-document";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const bookingResponse = await fetch(`${API_URL}/api/bookings/${id}`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  });

  if (!bookingResponse.ok) {
    return NextResponse.json(
      { message: "Booking not found" },
      { status: bookingResponse.status },
    );
  }

  const booking = (await bookingResponse.json()) as BookingDetail;
  const buffer = await renderToBuffer(
    createElement(TicketDocument, {
      bookingId: id,
      booking,
    }) as ReactElement<DocumentProps>,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ticketflow-${id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
