import type { Metadata } from "next";
import { Dancing_Script, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { CartProvider } from "@/lib/cart-context";

import { SessionProviderWrapper } from "@/app/components/SessionProviderWrapper";
import { Toaster } from "sonner";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    template: "%s | Ma petite Jacqueline",
    default: "Ma petite Jacqueline - Bijoux uniques en vaisselle ancienne",
  },
  description: "Créations uniques et artisanales de bijoux façonnés à partir de vaisselle ancienne de famille. Colliers, boucles d'oreilles et bagues pleines d'histoire.",
  openGraph: {
    title: "Ma petite Jacqueline",
    description: "Bijoux uniques issus de vaisselle ancienne.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: "Ma petite Jacqueline",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={cn(
          "h-full font-body antialiased flex flex-col bg-brand-light text-brand-text overflow-hidden",
          dancingScript.variable,
          inter.variable
        )}
      >
        <SessionProviderWrapper>
          <CartProvider>
            <div className="flex flex-col h-dvh overflow-hidden">
              <Header />
              <main className="flex-1 overflow-hidden flex flex-col">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster position="bottom-right" richColors />
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
