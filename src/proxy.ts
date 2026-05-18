import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";


// ROUTES THAT DON'T NEED LOGIN
//  These pages are public.
// Anyone can access them without authentication.

const PUBLIC_ROUTES = ["/"];
export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // SKIP NEXT.JS INTERNAL FILES
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        /\.(png|jpg|jpeg|gif|webp|svg|ico)$/.test(pathname)
    ) {
        return NextResponse.next();
    }


    // ALLOW PUBLIC API ROUTES
    // If current path exists in PUBLIC_APIS, then allow access without login.

    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // ALLOW PUBLIC PAGES
    // If route is public
    // Example: "/", then don't check authentication.
    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    const session = await auth();
    if (!session) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const role = session.user?.role;

    if (pathname.startsWith("/admin")) {
        if (role != "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    if (pathname.startsWith("/partner")) {
        if(pathname.startsWith("/partner/onboarding")){
            return NextResponse.next()
        }
        if (role != "partner") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }
    if (pathname.startsWith("/api")) {
        if (!session.user) {
            return Response.json(
                {message: "Unauthorized",},
                { status: 401 },
            );
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
