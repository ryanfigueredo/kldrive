import { Figtree } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { type Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import ClientLayout from "@/components/ClientLayout";
import { ThemeProvider } from "next-themes";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "KL Frotas",
  description: "Gestão de frotas KL",
  themeColor: "#0f172a",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    title: "KL Frotas",
    statusBarStyle: "default",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: Session | null = await getServerSession(authOptions);

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={`${figtree.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <ClientLayout session={session}>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
