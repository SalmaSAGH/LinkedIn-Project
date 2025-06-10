import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// app/api/users/[id]/route.ts
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {

        const userId = params.id;
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                skills: true,
                image: true,
                experiences: true,
                educations: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        // Vérifier si l'utilisateur connecté est ami avec ce profil
        let isFriend = false;
        if (currentUserId && userId !== currentUserId) {
            const friendship = await prisma.friendship.findFirst({
                where: {
                    OR: [
                        {
                            senderId: currentUserId,
                            receiverId: userId,
                            status: "ACCEPTED"
                        },
                        {
                            senderId: userId,
                            receiverId: currentUserId,
                            status: "ACCEPTED"
                        }
                    ]
                }
            });
            isFriend = !!friendship;
        }

        return NextResponse.json({
            ...user,
            isFriend: userId === currentUserId ? undefined : isFriend
        });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}