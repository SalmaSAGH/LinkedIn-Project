import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // Récupération du postId depuis l'URL
        const postIdMatch = req.nextUrl.pathname.match(/\/posts\/([^/]+)\/like/);
        const postId = postIdMatch?.[1];

        if (!postId) {
            return NextResponse.json({ error: "ID du post manquant" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);

        let currentUser = null;
        if (session?.user?.email) {
            currentUser = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true },
            });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
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

        if (!post) {
            return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
        }

        const [likesCount, commentsCount, userLike, comments] = await Promise.all([
            prisma.like.count({ where: { postId } }),
            prisma.comment.count({ where: { postId } }),
            currentUser
                ? prisma.like.findFirst({
                    where: { postId, userId: currentUser.id },
                })
                : null,
            prisma.comment.findMany({
                where: { postId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 3,
            }),
        ]);

        return NextResponse.json({
            ...post,
            likesCount,
            commentsCount,
            isLikedByCurrentUser: !!userLike,
            comments,
            canEdit: currentUser?.id === post.userId,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du post:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
