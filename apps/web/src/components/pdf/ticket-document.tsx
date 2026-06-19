import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { BookingDetail } from "@repo/types";
import { SEAT_PRICE } from "@/lib/api";
import { formatEventDate } from "@/lib/event-filters";
import { formatBookedAt, formatCurrency } from "@/lib/format";
import { theme } from "@/lib/pdfx-theme";
import { compareSeatNumbers } from "@/lib/seat-layout";

export interface TicketDocumentProps {
  bookingId: string;
  booking: BookingDetail;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: theme.spacing.page.marginTop,
    paddingRight: theme.spacing.page.marginRight,
    paddingBottom: theme.spacing.page.marginBottom,
    paddingLeft: theme.spacing.page.marginLeft,
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.foreground,
  },
  header: {
    marginBottom: theme.spacing.sectionGap,
    paddingBottom: theme.spacing.componentGap,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  brand: {
    fontSize: theme.primitives.typography.sm,
    color: theme.colors.primary,
    fontWeight: theme.primitives.fontWeights.semibold,
    letterSpacing: theme.primitives.letterSpacing.wide,
    textTransform: "uppercase",
    marginBottom: theme.primitives.spacing[1],
  },
  title: {
    fontSize: theme.typography.heading.fontSize.h2,
    fontFamily: theme.typography.heading.fontFamily,
    fontWeight: theme.primitives.fontWeights.bold,
    color: theme.colors.foreground,
  },
  subtitle: {
    marginTop: theme.primitives.spacing[1],
    fontSize: theme.primitives.typography.sm,
    color: theme.colors.mutedForeground,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: theme.spacing.componentGap,
    paddingVertical: theme.primitives.spacing[1],
    paddingHorizontal: theme.primitives.spacing[2],
    borderRadius: theme.primitives.borderRadius.full,
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    fontSize: theme.primitives.typography.xs,
    color: theme.colors.primaryForeground,
    fontWeight: theme.primitives.fontWeights.semibold,
    textTransform: "uppercase",
  },
  section: {
    marginBottom: theme.spacing.sectionGap,
  },
  sectionTitle: {
    fontSize: theme.primitives.typography.sm,
    fontWeight: theme.primitives.fontWeights.semibold,
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: theme.primitives.letterSpacing.wide,
    marginBottom: theme.spacing.componentGap,
  },
  eventName: {
    fontSize: theme.primitives.typography.xl,
    fontWeight: theme.primitives.fontWeights.bold,
    marginBottom: theme.primitives.spacing[2],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.primitives.spacing[4],
    paddingVertical: theme.primitives.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: theme.primitives.typography.sm,
    color: theme.colors.mutedForeground,
    width: "34%",
  },
  detailValue: {
    fontSize: theme.primitives.typography.sm,
    color: theme.colors.foreground,
    width: "66%",
    textAlign: "right",
  },
  seatWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.primitives.spacing[2],
  },
  seatBadge: {
    paddingVertical: theme.primitives.spacing[1],
    paddingHorizontal: theme.primitives.spacing[2],
    borderRadius: theme.primitives.borderRadius.md,
    backgroundColor: theme.colors.muted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  seatText: {
    fontSize: theme.primitives.typography.sm,
    fontFamily: "Courier",
    color: theme.colors.foreground,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.componentGap,
    paddingTop: theme.spacing.componentGap,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: theme.primitives.typography.base,
    fontWeight: theme.primitives.fontWeights.semibold,
  },
  totalValue: {
    fontSize: theme.primitives.typography.lg,
    fontWeight: theme.primitives.fontWeights.bold,
    color: theme.colors.primary,
  },
  footer: {
    marginTop: "auto",
    paddingTop: theme.spacing.sectionGap,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerText: {
    fontSize: theme.primitives.typography.xs,
    color: theme.colors.mutedForeground,
    lineHeight: theme.primitives.lineHeights.relaxed,
  },
});

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function TicketDocument({ bookingId, booking }: TicketDocumentProps) {
  const sortedSeats = [...booking.seatNumbers].sort(compareSeatNumbers);
  const total = sortedSeats.length * SEAT_PRICE;

  return (
    <Document title={`TicketFlow ticket ${bookingId}`} author="TicketFlow">
      <Page size={theme.page.size} style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>TicketFlow</Text>
          <Text style={styles.title}>Event ticket</Text>
          <Text style={styles.subtitle}>
            Present this ticket at the venue entrance
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Confirmed</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event</Text>
          <Text style={styles.eventName}>{booking.event.name}</Text>
          <DetailRow
            label="Date & time"
            value={formatEventDate(booking.event.date)}
          />
          <DetailRow label="Venue" value={booking.event.venue} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking</Text>
          <DetailRow label="Reference" value={bookingId} />
          <DetailRow
            label="Booked on"
            value={formatBookedAt(booking.bookedAt)}
          />
          <DetailRow
            label="Seats"
            value={`${sortedSeats.length} seat${sortedSeats.length === 1 ? "" : "s"}`}
          />
          <View style={styles.seatWrap}>
            {sortedSeats.map((seat) => (
              <View key={seat} style={styles.seatBadge}>
                <Text style={styles.seatText}>{seat}</Text>
              </View>
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This ticket is valid for the seats listed above. Arrive at least 15
            minutes before the event start time. For support, reference your
            booking ID at the box office.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
