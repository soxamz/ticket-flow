export function getRouteParam(
  param: string | string[] | undefined,
): string | null {
  if (typeof param === "string") {
    return param;
  }
  return null;
}
