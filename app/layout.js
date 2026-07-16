import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata = {
  title: "نور الوالدين — منصة ختم القرآن الكريم",
  description: "منصة لتيسير ختم القرآن الكريم وإهداء الأجر للوالدين ومن نحب.",
};

export default function RootLayout({ children }) {
  return <html lang="ar" dir="rtl"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" /></head><body><ToastProvider>{children}</ToastProvider></body></html>;
}
