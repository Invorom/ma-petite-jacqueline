import type { Metadata } from "next";
import { Dancing_Script, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { CartProvider } from "@/lib/cart-context";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Ma petite Jacqueline",
  description: "Bijoux uniques issus de vaisselle ancienne.",
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
        <CartProvider>
          <Header />
          <main className="flex-1 overflow-y-auto scroll-smooth">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
