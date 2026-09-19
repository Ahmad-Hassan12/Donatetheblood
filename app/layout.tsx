import type { Metadata } from "next";
import { Geist, Archivo } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://donatetheblood.pk"),
  title: "Donate the Blood — Find a blood donor in an emergency",
  icons: {
    icon: "/images/faviicon.png",
    apple: "/images/faviicon.png",
  },
  description:
    "Donate the Blood connects people who need blood with verified donors nearby — in the minutes that matter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <SmoothScroll />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}