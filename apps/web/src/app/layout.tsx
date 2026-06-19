import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/components/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "TicketFlow",
    template: "%s | TicketFlow",
  },
  description:
    "TicketFlow helps you discover events, reserve seats, and manage bookings.",
  applicationName: "TicketFlow",
  keywords: [
    "TicketFlow",
    "event tickets",
    "seat booking",
    "reservations",
    "live events",
  ],
  openGraph: {
    title: "TicketFlow",
    description:
      "Discover events, reserve seats, and manage your bookings in one place.",
    url: "/",
    siteName: "TicketFlow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TicketFlow",
    description:
      "Discover events, reserve seats, and manage your bookings in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
