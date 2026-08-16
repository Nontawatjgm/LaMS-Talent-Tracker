import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Masia Rising Stars — Pre-Season Tracker",
  description:
    "ติดตามนักเตะดาวรุ่งจาก La Masia ของ FC Barcelona ที่ได้รับโอกาสขึ้นฝึกซ้อมกับทีมชุดใหญ่ช่วง Pre-Season ในแต่ละปี",
  keywords: ["La Masia", "FC Barcelona", "Pre-Season", "Youth Academy", "Barça", "นักเตะดาวรุ่ง"],
  openGraph: {
    title: "La Masia Rising Stars — Pre-Season Tracker",
    description: "Track FC Barcelona La Masia talents who feature in pre-season each year",
    type: "website",
  },
};

import { getPlayers } from "./utils/supabase/queries";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const players = await getPlayers();
  
  return (
    <html
      lang="th"
      className={`${inter.variable} ${outfit.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--bg-dark)] text-[var(--text-primary)] antialiased">
        <Navbar players={players} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
