import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const display = Baloo_2({ subsets: ["latin", "vietnamese"], weight: ["600", "700", "800"], variable: "--font-display" });
const body = Nunito({ subsets: ["latin", "vietnamese"], weight: ["500", "600", "700", "800"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Rồng DC Academy",
  description: "Học đầu tư quỹ 5 phút mỗi ngày cùng Rồng DC",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#16A571" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`}>
      {/* Phone-first column, like the prototype; desktop just centres it. */}
      <body>
        <div className="mx-auto flex min-h-full max-w-[480px] flex-col bg-surface shadow-sm">{children}</div>
      </body>
    </html>
  );
}
