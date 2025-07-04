"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

type User = {
    id: string;
    name: string;
    image: string | null;
    bio?: string | null;
    skills: string[] | null;
};

type Post = {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    updatedAt?: string;
    imageUrl?: string;
    canEdit?: boolean;
    user: {
        id?: string;
        name?: string | null;
        image?: string | null;
    };
    likesCount: number;
    commentsCount: number;
    isLikedByCurrentUser: boolean;
};

export default function SearchPageClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") as "users" | "posts" | null;

    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            const res = await fetch(
                `/api/search?q=${encodeURIComponent(q)}&type=${type || "all"}`
            );
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setPosts(data.posts || []);
            }
            setLoading(false);
        };

        if (!q) {
            router.push("/"); // ou un message vide
        } else {
            fetchResults();
        }
    }, [q, type]);

    if (loading) return <div className="p-6">Chargement...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">
                Résultats pour &#34;{decodeURIComponent(q)}&#34;
            </h1>

            {/* tes boutons Tous / Personnes / Publications */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <Link
                    href={`/search?q=${encodeURIComponent(q)}`}
                    className={`pb-2 px-1 ${!type ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Tous
                </Link>
                <Link
                    href={`/search?q=${encodeURIComponent(q)}&type=users`}
                    className={`pb-2 px-1 ${type === "users" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Personnes
                </Link>
                <Link
                    href={`/search?q=${encodeURIComponent(q)}&type=posts`}
                    className={`pb-2 px-1 ${type === "posts" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Publications
                </Link>
            </div>

            {/* Liste utilisateurs et publications comme dans ton code */}
            {(!type || type === "users") && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Personnes</h2>
                    {users.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {users.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/profile/${user.id}`}
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <Image
                                        src={user.image || "/default-avatar.png"}
                                        alt={user.name}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <h3 className="font-medium">{user.name}</h3>
                                        {user.bio && (
                                            <p className="text-sm text-gray-600">{user.bio}</p>
                                        )}
                                        {Array.isArray(user.skills) && user.skills.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {user.skills.slice(0, 3).map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                            {skill}
                          </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Search className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2">Aucune personne trouvée</p>
                        </div>
                    )}
                </div>
            )}

            {(!type || type === "posts") && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Publications</h2>
                    {posts.length > 0 ? (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/posts/${post.id}`}
                                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center mb-3">
                                        <Image
                                            src={post.user.image || "/default-avatar.png"}
                                            alt={post.user.name ?? "Utilisateur"}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                        <span className="font-medium">{post.user.name}</span>
                                    </div>
                                    <p className="text-gray-800">{post.body || post.title}</p>
                                    {post.imageUrl && (
                                        <Image
                                            src={post.imageUrl}
                                            alt="Post image"
                                            width={400}
                                            height={300}
                                            className="mt-3 rounded-lg max-h-60 object-cover"
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Search className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2">Aucune publication trouvée</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
