import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { WhatsAppWidget } from "@/components/ui/whatsapp-widget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Turatti | Experiência Premium",
  description: "Descubra o auge do design e sofisticação com a Turatti.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Turatti",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter antialiased`} suppressHydrationWarning>
        <TooltipProvider>
          {children}
          <Toaster />
          <ScrollToTop />
          <WhatsAppWidget />
        </TooltipProvider>
      </body>
    </html>
  );
}
