export function generateSeatNumbers(totalSeats: number): string[] {
  const seatsPerRow = 10;
  const rowCount = Math.ceil(totalSeats / seatsPerRow);
  const seats: string[] = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = String.fromCharCode(65 + rowIndex);
    for (let seatIndex = 1; seatIndex <= seatsPerRow; seatIndex++) {
      if (seats.length >= totalSeats) {
        break;
      }
      seats.push(`${row}${seatIndex}`);
    }
  }

  return seats;
}
