import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    // Protege tudo, exceto login
    "/((?!login|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
