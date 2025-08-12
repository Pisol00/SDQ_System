import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../contexts/AppContext";
import { LazyLayoutContent } from "../components/LazyWrapper";
import { Toaster } from "@/components/ui/sonner";

const sarabun = Sarabun({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ระบบประเมิน SDQ - Student Assessment System",
  description: "แบบประเมินพฤติกรรมนักเรียน (SDQ) ฉบับครูประเมินนักเรียน",
  keywords: "SDQ, นักเรียน, ประเมินพฤติกรรม, โรงเรียน",
  authors: [{ name: "Student Assessment System" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sarabun antialiased`}>
        <AppProvider>
          <LazyLayoutContent>
            {children}
            <Toaster />
          </LazyLayoutContent>
        </AppProvider>
      </body>
    </html>
  );
}