import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function GET() {
    try {
        await connectDB();
        const session = await auth();
        console.log("SESSION:", session);
        console.log("EMAIL:", session?.user?.email);

        if (!session?.user) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }
        let user = await User.findOne({ email: session.user.email });
        if (!user) {
            user = await User.create({
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                isEmailVerified: true,
                role: "user",
            });
            return Response.json(
                {user},
                { status: 201 },
            );
        }
        return Response.json(
            {user},
            { status: 200 },
        );
    } catch (error) {
        return Response.json(
            { message: `The server encountered an error: ${error}` },
            { status: 500 },
        );
    }
}
