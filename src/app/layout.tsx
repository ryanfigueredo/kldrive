import { Figtree } from "next/font/google";
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
