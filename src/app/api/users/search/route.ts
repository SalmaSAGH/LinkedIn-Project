import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    try {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: { contains: query, mode: "insensitive" } },
                            { email: { contains: query, mode: "insensitive" } },
                        ],
                    },
                    { id: { not: session.user.id } }, // Exclure l'utilisateur actuel
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
            take: 10,
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}