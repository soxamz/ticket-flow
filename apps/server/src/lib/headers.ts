import type { IncomingHttpHeaders } from "node:http";

export function toRequestHeaders(headers: IncomingHttpHeaders): Headers {
  const result = new Headers();

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      result.set(key, value.join(", "));
    } else {
      result.set(key, value);
    }
  }

  return result;
}
