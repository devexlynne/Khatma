import "./globals.css";
import { Suspense } from "react";
import { ToastProvider } from "@/components/Toast";
import VisitTracker from "@/components/VisitTracker";

export const metadata = {
  title: "نور الوالدين — منصة ختم القرآن الكريم",
  description: "منصة لتيسير ختم القرآن الكريم وإهداء الأجر للوالدين ومن نحب.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/noor-clean-192.png", sizes: "192x192", type: "image/png" },
      { url: "/noor-clean-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/noor-clean-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport = { themeColor: "#2b2035" };

export default function RootLayout({ children }) {
  return <html lang="ar" dir="rtl"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Amiri+Quran&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" /></head><body><ToastProvider>{children}<Suspense fallback={null}><VisitTracker /></Suspense></ToastProvider></body></html>;
}
