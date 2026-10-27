import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Library Management Helpdesk Bot",
  description:
    "A rule-based chatbot for library book searches, borrowing, returns, due dates, and library rules.",
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