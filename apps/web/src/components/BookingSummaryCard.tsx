import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { SEAT_PRICE } from "@/lib/api";

interface BookingSummaryCardProps {
  eventName: string;
  eventDate: string;
  venue: string;
  seatNumbers: string[];
}

export function BookingSummaryCard({
  eventName,
  eventDate,
  venue,
  seatNumbers,
}: BookingSummaryCardProps) {
  const total = seatNumbers.length * SEAT_PRICE;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{eventName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-1 text-muted-foreground">
          <p>
            {new Date(eventDate).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p>{venue}</p>
        </div>
        <Separator />
        <div className="flex flex-wrap gap-2">
          {seatNumbers.map((seat) => (
            <Badge key={seat} variant="secondary">
              {seat}
            </Badge>
          ))}
        </div>
        <Separator />
        <p className="font-medium text-base">
          Total: ₹{total.toLocaleString("en-IN")}
        </p>
      </CardContent>
    </Card>
  );
}
