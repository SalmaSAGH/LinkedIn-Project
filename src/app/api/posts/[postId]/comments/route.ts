import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: { postId: string } }
) {
    try {
        const { postId } = params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { content } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: "Le contenu du commentaire est requis" }, { status: 400 });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { user: true }
        });

        if (!post) {
            return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                userId: user.id,
                postId: postId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        // Créer une notification seulement si l'utilisateur qui commente n'est pas le propriétaire du post
        if (user.id !== post.userId) {
            await prisma.notification.create({
                data: {
                    userId: post.userId,
                    type: "POST_COMMENT",
                    content: `${user.name || "Quelqu'un"} a commenté votre publication: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
                    metadata: {
                        postId: post.id,
                        senderId: user.id,
                        commentId: comment.id,
                        type: "post"
                    }
                }
            });
        }

        return NextResponse.json({
            ...comment,
            canEdit: true,
        });
    } catch (error) {
        console.error("Erreur lors de la création du commentaire:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}