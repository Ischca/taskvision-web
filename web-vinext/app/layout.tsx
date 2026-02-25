import "./globals.css";
import { AuthProvider } from "../src/app/components/AuthProvider";
import ThemeProvider from "../src/app/components/ThemeProvider";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "TaskVision",
  description: "シンプルかつ使いやすいタスク管理アプリ",
  keywords: ["タスク管理", "タイムブロック", "生産性"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
