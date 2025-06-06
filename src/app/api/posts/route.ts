import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    });

    return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { content } = await req.json();

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const post = await prisma.post.create({
        data: {
            title: user.name ?? "Utilisateur",
            body: content,
            userId: user.id,
        },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    });

    return NextResponse.json(post);
}

