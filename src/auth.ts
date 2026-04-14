import NextAuth from "next-auth";
import { authOption } from "./app/api/auth/[...nextauth]/options";

export const { handlers, auth, signIn, signOut } = NextAuth(authOption)
