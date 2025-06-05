import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const token = await getToken({ req });

    if (!token || !token.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: token.email },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
}

export async function PATCH(req: Request) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const token = await getToken({ req });

    if (!token || !token.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, skills, image } = body;

    try {
        const updatedUser = await prisma.user.update({
            where: { email: token.email },
            data: {
                name,
                bio,
                skills,
                image,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Erreur PATCH profile :", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}

