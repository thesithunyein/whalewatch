import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhaleWatch - Real-time Solana Whale Tracking",
  description: "Track whale movements in real-time. Get notified when smart money makes moves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
