import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "@/lib/theme/context";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1816" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Meal Plan",
  description: "Your personal meal plan",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Meal Plan",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") ?? "en";

  return (
    <html lang={locale}>
      <body
        className={`${geist.variable} font-sans bg-canvas text-ink antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('meal-plan-theme');var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&prefersDark)){document.documentElement.classList.add('dark');}}catch(e){}})();` }} />
        <ThemeProvider>
          <div className="pt-safe pb-safe px-safe min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
