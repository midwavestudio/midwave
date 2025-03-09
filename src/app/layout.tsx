import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "../lib/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Midwave Studio | Design & Software Development Agency",
  description: "Midwave Studio redefines digital craftsmanship for discerning clients across the United States, specializing in high-fidelity digital design and custom software solutions.",
  keywords: ["design agency", "software development", "luxury digital solutions", "high-end web design"],
};

// Simple error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Analytics />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
