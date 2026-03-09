import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

console.log('NextAuth Debug:', {
    hasId: !!process.env.GOOGLE_CLIENT_ID,
    idLength: process.env.GOOGLE_CLIENT_ID?.trim().length,
    idEnd: process.env.GOOGLE_CLIENT_ID?.trim().slice(-10),
    hasSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    secretLength: process.env.GOOGLE_CLIENT_SECRET?.trim().length
});

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: (process.env.GOOGLE_CLIENT_ID || "").trim(),
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
        }),
    ],
    secret: (process.env.NEXTAUTH_SECRET || "").trim(),
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            return session;
        },
    },
});

export { handler as GET, handler as POST };
