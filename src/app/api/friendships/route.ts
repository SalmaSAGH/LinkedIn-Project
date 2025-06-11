// app/api/friendships/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";


// app/api/friendships/sent-requests/route.ts
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        const sentRequests = await prisma.friendship.findMany({
            where: {
                senderId: user.id,
                status: "PENDING" // Seulement les demandes en attente
            },
            select: {
                receiverId: true
            }
        });

        return NextResponse.json(sentRequests);
    } catch (error) {
        console.error("Erreur lors de la récupération des demandes:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { receiverId } = await req.json();

        const sender = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!sender) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    {
                        senderId: sender.id,
                        receiverId
                    },
                    {
                        senderId: receiverId,
                        receiverId: sender.id
                    }
                ]
            }
        });

        if (existingFriendship) {
            if (existingFriendship.status === "REJECTED") {
                // Supprimer l'ancienne demande rejetée
                await prisma.friendship.delete({
                    where: { id: existingFriendship.id }
                });
            } else {
                return NextResponse.json(
                    {
                        error: existingFriendship.status === "PENDING"
                            ? "Une demande est déjà en attente"
                            : "Vous êtes déjà connectés"
                    },
                    { status: 400 }
                );
            }
        }

        if (existingFriendship) {
            return NextResponse.json(
                {
                    error: existingFriendship.status === "PENDING"
                        ? "Une demande est déjà en attente"
                        : "Vous êtes déjà connectés"
                },
                { status: 400 }
            );
        }

        // Créer la demande d'amitié
        const friendship = await prisma.friendship.create({
            data: {
                senderId: sender.id,
                receiverId,
                status: "PENDING"
            }
        });

        // Créer une notification pour le receveur
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: "FRIEND_REQUEST",
                content: `${session.user.name || "Quelqu'un"} vous a envoyé une demande de connexion`,
                metadata: {
                    friendshipId: friendship.id,
                    senderId: sender.id
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de l'envoi de la demande:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { friendshipId, action } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Mettre à jour l'amitié
        const updatedFriendship = await prisma.friendship.update({
            where: { id: friendshipId },
            data: {
                status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED"
            },
            include: {
                sender: true,
                receiver: true
            }
        });

        // Mettre à jour la notification
        await prisma.notification.updateMany({
            where: {
                metadata: {
                    path: ["friendshipId"],
                    equals: friendshipId
                }
            },
            data: {
                metadata: {
                    ...updatedFriendship
                }
            }
        });

        // Créer une notification pour l'expéditeur si accepté
        if (action === "ACCEPT") {
            await prisma.notification.create({
                data: {
                    userId: updatedFriendship.senderId,
                    type: "FRIEND_REQUEST_RESPONSE",
                    content: `${user.name || "Quelqu'un"} a accepté votre demande de connexion`,
                    metadata: {
                        friendshipId: updatedFriendship.id,
                        status: "ACCEPTED"
                    }
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'amitié:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// app/api/friendships/route.ts
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { userId } = await req.json();

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!currentUser) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Trouver et supprimer l'amitié dans les deux sens
        await prisma.friendship.deleteMany({
            where: {
                OR: [
                    {
                        senderId: currentUser.id,
                        receiverId: userId,
                        status: "ACCEPTED"
                    },
                    {
                        senderId: userId,
                        receiverId: currentUser.id,
                        status: "ACCEPTED"
                    }
                ]
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}