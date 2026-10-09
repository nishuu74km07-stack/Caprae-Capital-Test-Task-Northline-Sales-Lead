import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { Shell } from "@/components/layout/Shell";
import { StoreProvider } from "@/store/StoreProvider";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-northline-display",
});
const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-northline-sans",
});

export const metadata: Metadata = {
  title: "Northline",
  description: "Fit-first lead desk for acquisition entrepreneurs. Rank a scraped list before you spend an enrichment credit.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
