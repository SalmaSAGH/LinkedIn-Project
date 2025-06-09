// app/api/friendships/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// app/api/friendships/route.ts
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { receiverId } = await req.json();

        const sender = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true }
        });

        if (!sender) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Vérifier si une demande existe déjà
        const existingRequest = await prisma.friendship.findFirst({
            where: {
                senderId: sender.id,
                receiverId,
                status: "PENDING"
            }
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: "Demande déjà envoyée" },
                { status: 400 }
            );
        }

        // Créer la nouvelle demande
        const friendship = await prisma.friendship.create({
            data: {
                senderId: sender.id,
                receiverId,
                status: "PENDING"
            }
        });

        // Créer la notification
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: "FRIEND_REQUEST",
                content: `${sender.name || "Quelqu'un"} vous a envoyé une demande de connexion`,
                metadata: {
                    friendshipId: friendship.id,
                    senderId: sender.id
                }
            }
        });

        return NextResponse.json({
            success: true,
            friendshipId: friendship.id
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de la demande:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}


// app/api/friendships/route.ts
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { friendshipId, action } = await req.json();

        // 1. Mettre à jour la demande d'amitié
        const updatedFriendship = await prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" },
            include: { sender: true }
        });

        // 2. Mettre à jour la notification existante
        await prisma.notification.updateMany({
            where: {
                metadata: {
                    path: ["friendshipId"],
                    equals: friendshipId
                }
            },
            data: {
                read: true,
                metadata: {
                    ...updatedFriendship,
                    status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED"
                }
            }
        });

        // 3. Créer une nouvelle notification pour l'expéditeur
        await prisma.notification.create({
            data: {
                userId: updatedFriendship.senderId,
                type: "FRIEND_REQUEST_RESPONSE",
                content: `Votre demande a été ${action === "ACCEPT" ? "acceptée" : "refusée"}`,
                read: false,
                metadata: {
                    friendshipId,
                    status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED"
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}