import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareBridge | Multilingual Emergency Healthcare Navigation",
  description:
    "Fast, multilingual emergency healthcare navigation assistant. Classifies urgency, gives immediate guidance, finds nearby 24/7 emergency facilities, and triggers 1-tap rescue actions in Hindi, English, Hinglish, and Bengali.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-zinc-900 font-sans selection:bg-teal-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}
