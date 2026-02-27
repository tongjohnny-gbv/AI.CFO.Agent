import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";

export const authOptions = {
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      server: process.env.EMAIL_SERVER || "smtp://user:pass@mailhog:1025"
    })
  ],
  secret: process.env.NEXTAUTH_SECRET
};

export const { handlers } = NextAuth(authOptions as any);
