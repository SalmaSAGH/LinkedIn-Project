// app/api/search/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all"; // 'users', 'posts' ou 'all'

    try {
        if (!query.trim()) {
            return NextResponse.json(
                { error: "Le terme de recherche est requis" },
                { status: 400 }
            );
        }

        // Recherche d'utilisateurs
        if (type === "users" || type === "all") {
            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        { name: { startsWith: query, mode: "insensitive" } },
                        { bio: { contains: query, mode: "insensitive" } },
                        { skills: { hasSome: [query] } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    bio: true,
                    skills: true,
                },
                take: 5,
            });

            if (type === "users") {
                return NextResponse.json(users);
            }
        }

        // Recherche de posts
        if (type === "posts" || type === "all") {
            const posts = await prisma.post.findMany({
                where: {
                    OR: [
                        { body: { contains: query, mode: "insensitive" } },
                        { title: { contains: query, mode: "insensitive" } },
                    ],
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
                take: 5,
            });

            if (type === "posts") {
                return NextResponse.json(posts);
            }
        }

        // Si type === 'all', retourner les deux
        const [users, posts] = await Promise.all([
            prisma.user.findMany({
                where: {
                    OR: [
                        { name: { startsWith: query, mode: "insensitive" } },
                        { bio: { contains: query, mode: "insensitive" } },
                        { skills: { hasSome: [query] } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    bio: true,
                    skills: true,
                },
                take: 5,
            }),
            prisma.post.findMany({
                where: {
                    OR: [
                        { body: { contains: query, mode: "insensitive" } },
                        { title: { contains: query, mode: "insensitive" } },
                    ],
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
                take: 5,
            }),
        ]);

        return NextResponse.json({ users, posts });
    } catch (error) {
        console.error("Erreur de recherche:", error);
        return NextResponse.json(
            { error: "Erreur lors de la recherche" },
            { status: 500 }
        );
    }
}