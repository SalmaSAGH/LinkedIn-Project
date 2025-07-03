import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
    try {
        // Extraire postId de l’URL via RegEx
        const postIdMatch = req.nextUrl.pathname.match(/\/posts\/([^/]+)\/like/);
        const postId = postIdMatch?.[1];

        if (!postId) {
            return NextResponse.json({ error: "ID du post manquant" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Vérifier si le post existe
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { user: true }
        });

        if (!post) {
            return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
        }

        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Vérifier si l'utilisateur a déjà liké ce post
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: postId,
                },
            },
        });

        if (existingLike) {
            // Supprimer le like (unlike)
            await prisma.like.delete({
                where: { id: existingLike.id },
            });

            return NextResponse.json({
                liked: false,
                message: "Like retiré"
            });
        } else {
            // Ajouter le like
            await prisma.like.create({
                data: {
                    userId: user.id,
                    postId: postId,
                },
            });

            // Créer une notification si ce n'est pas l'auteur du post
            if (user.id !== post.userId) {
                await prisma.notification.create({
                    data: {
                        userId: post.userId,
                        type: "POST_LIKE",
                        content: `${user.name || "Quelqu'un"} a aimé votre publication`,
                        metadata: {
                            postId: post.id,
                            senderId: user.id,
                            type: "post"
                        }
                    }
                });
            }

            return NextResponse.json({
                liked: true,
                message: "Post liké"
            });
        }
    } catch (error) {
        console.error("Erreur lors de la gestion du like:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
