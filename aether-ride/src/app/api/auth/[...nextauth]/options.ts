import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authOption: NextAuthConfig = {
    trustHost: true,
    providers: [
        Credentials({
            credentials: {
                email: {
                    type: "email",
                    label: "Email",
                    placeholder: "johndoe@gmail.com",
                },
                password: {
                    type: "password",
                    label: "Password",
                    placeholder: "*****",
                },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }
                const email = (credentials.email as string).trim().toLowerCase();
                const password = credentials.password as string;
                await connectDB();
                const user = await User.findOne({ email });
                if (!user) {
                    throw new Error("User does not exist");
                }
                if (!user.password) {
                    throw new Error("This account was created with Google. Please use Google Sign In.");
                }
                const isMatched = await bcrypt.compare(password, user.password);
                if (!isMatched) {
                    throw new Error("Incorrect Password");
                }
                return {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    name: user.name
                };
            }
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await connectDB();
                let existingUser = await User.findOne({ email: user.email?.toLowerCase() });
                if (!existingUser) {
                    existingUser = await User.create({
                        name: user.name,
                        email: user.email?.toLowerCase(),
                        isEmailVerified: true,
                        role: "user"
                    });
                }
                user.id = existingUser._id.toString();
                user.role = existingUser.role || "user";
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.name = user.name;
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
            }
            if (token.email) {
                await connectDB();
                const dbUser = await User.findOne({ email: (token.email as string).toLowerCase() });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.role = dbUser.role;
                    token.name = dbUser.name;
                    token.email = dbUser.email;
                }
            }
            return token;
        },
        async session({ token, session }) {
            if (session.user) {
                session.user.name = (token.name as string) ?? null;
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.role = (token.role as string) ?? "user";
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 10 * 24 * 60 * 60
    },
    secret: process.env.AUTH_SECRET
};
