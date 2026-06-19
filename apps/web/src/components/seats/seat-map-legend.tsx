import { Badge } from "@repo/ui/components/badge";

export function SeatMapLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      <p className="font-bold">Book your seat</p>
      <span>|</span>
      <Badge variant="outline">Available</Badge>
      <Badge variant="secondary">Reserved</Badge>
      <Badge variant="destructive">Booked</Badge>
      <Badge>Selected</Badge>
    </div>
  );
}
