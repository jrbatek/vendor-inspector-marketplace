import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import DemoModeBanner from "@/components/DemoModeBanner";

export const metadata: Metadata = {
  title: "InspectSource",
  description: "Vendor inspection marketplace MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DemoModeBanner />
        <Nav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
