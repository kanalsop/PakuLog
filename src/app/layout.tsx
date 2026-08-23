import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "PakuLog",
  description: "毎日の食事と栄養状態を手軽に記録するWebアプリ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
