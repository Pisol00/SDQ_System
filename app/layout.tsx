import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../contexts/AppContext";
import Navigation from "../components/Navigation";

const sarabun = Sarabun({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
});

export const metadata: Metadata = {
  title: "ระบบประเมิน SDQ - Student Assessment System",
  description: "แบบประเมินพฤติกรรมนักเรียน (SDQ) ฉบับครูประเมินนักเรียน",
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
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main>
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}