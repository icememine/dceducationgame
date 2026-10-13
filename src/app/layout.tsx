import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getTheme } from "@/lib/theme";
import "./globals.css";

const sans = Manrope({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Rồng DC Academy",
  description: "Học đầu tư quỹ 5 phút mỗi ngày cùng Rồng DC",
};

export async function generateViewport(): Promise<Viewport> {
  return { width: "device-width", initialScale: 1, themeColor: (await getTheme()) === "dark" ? "#0E1421" : "#F3F5F9" };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme();
  return (
    <html lang="vi" data-theme={theme} className={sans.variable} style={{ "--font-display": "var(--font-body)" } as React.CSSProperties}>
      {/* Phone-first column; desktop just centres it. */}
      <body>
        <div className="mx-auto flex min-h-full max-w-[480px] flex-col bg-page shadow-sm">{children}</div>
      </body>
    </html>
  );
}
