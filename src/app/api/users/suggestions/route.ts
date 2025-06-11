import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// app/api/users/suggestions/route.ts
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!currentUser) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Récupérer les utilisateurs qui ne sont pas déjà amis
        const suggestions = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: currentUser.id } }, // Exclure l'utilisateur actuel
                    {
                        NOT: {
                            OR: [
                                // Exclure les amis acceptés
                                {
                                    sentFriendships: {
                                        some: {
                                            receiverId: currentUser.id,
                                            status: "ACCEPTED"
                                        }
                                    }
                                },
                                {
                                    receivedFriendships: {
                                        some: {
                                            senderId: currentUser.id,
                                            status: "ACCEPTED"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            take: 5,
            select: {
                id: true,
                name: true,
                image: true,
                skills: true,
                bio: true
            }
        });

        const formattedSuggestions = suggestions.map(user => ({
            id: user.id,
            name: user.name || "Utilisateur",
            avatar: user.image || "/default-avatar.png",
            role: user.bio || "Membre LinkedIn"
        }));

        return NextResponse.json(formattedSuggestions);
    } catch (error) {
        console.error("Erreur lors de la récupération des suggestions:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}