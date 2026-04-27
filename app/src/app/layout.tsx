import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  weight: ["700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CompSim Pro — MBA Compensation & Benefits Simulation",
  description:
    "A graduate-level, real-time compensation and benefits strategy simulation. Play as Compensation Lead at BharatQuick, India's fastest-growing quick-commerce platform, and navigate 6 high-stakes rounds toward a pre-IPO certification.",
  keywords: ["MBA", "HR simulation", "compensation", "benefits", "BharatQuick", "HES"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#020817]">{children}</body>
    </html>
  );
}
