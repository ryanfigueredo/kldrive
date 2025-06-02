import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

interface UserWithAvatar {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials): Promise<UserWithAvatar | null> {
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl ?? null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.avatarUrl = (user as UserWithAvatar).avatarUrl ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.image =
          typeof token.avatarUrl === "string"
            ? token.avatarUrl
            : session.user.image ?? "";
      }
      return session;
    },
  },
};
