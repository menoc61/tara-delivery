import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#FF6B2C",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title:       { default: "TARA DELIVERY", template: "%s | TARA DELIVERY" },
  description: "Livraison rapide et fiable à Yaoundé, Cameroun. Payez avec MTN MoMo ou Orange Money.",
  keywords:    ["livraison", "Yaoundé", "Cameroun", "MTN MoMo", "Orange Money", "TARA"],
  manifest:    "/manifest.json",
  icons:       { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  openGraph: {
    type:        "website",
    locale:      "fr_CM",
    siteName:    "TARA DELIVERY",
    title:       "TARA DELIVERY — Livraison Express à Yaoundé",
    description: "Commandez en 30 secondes. Livré en 30 minutes. Paiement MoMo & Orange Money.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${manrope.variable} ${inter.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "var(--font-inter)",
              fontSize: "14px",
              background: "#111827",
              color: "#FFFFFF",
              borderRadius: "1rem",
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#10B981", secondary: "#111827" },
            },
            error: {
              iconTheme: { primary: "#f28b82", secondary: "#191c1b" },
            },
          }}
        />
      </body>
    </html>
  );
}
