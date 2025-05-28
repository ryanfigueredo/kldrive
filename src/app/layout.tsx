import { Figtree } from "next/font/google";
import "./globals.css";

import SessionWrapper from "@/components/SessionWrapper";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import ClientLayout from "@/components/ClientLayout";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["600"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${figtree.className} antialiased`}>
        <SessionWrapper>
          <ClientLayout session={session}>{children}</ClientLayout>
        </SessionWrapper>
      </body>
    </html>
  );
}
