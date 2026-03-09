import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

console.log('NextAuth ID Prefix:', process.env.GOOGLE_CLIENT_ID?.slice(0, 5));

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
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
