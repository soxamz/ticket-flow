const DEFAULT_DOCS_URL =
  process.env.NODE_ENV === "production"
    ? "https://ticket-flow-docs.vercel.app/"
    : "http://localhost:3001/";

export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? DEFAULT_DOCS_URL;
