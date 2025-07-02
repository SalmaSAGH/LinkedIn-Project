// app/api/messages/search-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ users: [] });
        }

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: session.user.id } }, // Exclure l'utilisateur connecté
                    {
                        OR: [
                            { name: { contains: query, mode: "insensitive" } },
                            { email: { contains: query, mode: "insensitive" } },
                        ],
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true,
            },
            take: 10,
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Erreur recherche utilisateurs:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}