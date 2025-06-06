import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Récupérer l'utilisateur connecté si une session existe
        let currentUser = null;
        if (session?.user?.email) {
            currentUser = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });
        }

        // Récupérer les posts de base
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

        // Pour chaque post, récupérer les informations de likes et commentaires
        const postsWithCounts = await Promise.all(
            posts.map(async (post) => {
                const [likesCount, commentsCount, userLike, comments] = await Promise.all([
                    prisma.like.count({ where: { postId: post.id } }),
                    prisma.comment.count({ where: { postId: post.id } }),
                    currentUser
                        ? prisma.like.findFirst({
                            where: { postId: post.id, userId: currentUser.id }
                        })
                        : null,
                    prisma.comment.findMany({
                        where: { postId: post.id },
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                        orderBy: { createdAt: "desc" },
                        take: 3, // Limiter à 3 commentaires par défaut
                    })
                ]);

                return {
                    ...post,
                    likesCount,
                    commentsCount,
                    isLikedByCurrentUser: !!userLike,
                    comments,
                };
            })
        );

        return NextResponse.json(postsWithCounts);
    } catch (error) {
        console.error("Erreur lors de la récupération des posts:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { content } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: "Le contenu est requis" }, { status: 400 });
        }

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

        return NextResponse.json({
            ...post,
            isLikedByCurrentUser: false,
            likesCount: 0,
            commentsCount: 0,
            comments: [],
        });
    } catch (error) {
        console.error("Erreur lors de la création du post:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}