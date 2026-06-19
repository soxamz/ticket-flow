import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/components/sonner";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "TicketFlow",
    template: "%s | TicketFlow",
  },
  description: "Book event tickets with seat selection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} h-full`}>
      <body className="min-h-full bg-background font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster richColors theme="dark" position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
