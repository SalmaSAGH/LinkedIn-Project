// app/search/page.tsx
import { Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SearchPageProps {
    searchParams: {
        q: string;
        type?: "users" | "posts";
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q: query, type } = searchParams;

    if (!query) {
        return notFound();
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/search?q=${encodeURIComponent(query)}&type=${type || "all"}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        return <div>Erreur lors de la recherche</div>;
    }

    const { users = [], posts = [] } = await res.json();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">
                Résultats pour &#34;{decodeURIComponent(query)}&#34;
            </h1>

            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className={`pb-2 px-1 ${!type ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Tous
                </Link>
                <Link
                    href={`/search?q=${encodeURIComponent(query)}&type=users`}
                    className={`pb-2 px-1 ${type === "users" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Personnes
                </Link>
                <Link
                    href={`/search?q=${encodeURIComponent(query)}&type=posts`}
                    className={`pb-2 px-1 ${type === "posts" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Publications
                </Link>
            </div>

            {(!type || type === "users") && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Personnes</h2>
                    {users.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {users.map((user: any) => (
                                <Link
                                    key={user.id}
                                    href={`/profile/${user.id}`}
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <img
                                        src={user.image || "/default-avatar.png"}
                                        alt={user.name}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <h3 className="font-medium">{user.name}</h3>
                                        {user.bio && <p className="text-sm text-gray-600">{user.bio}</p>}
                                        {user.skills?.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {user.skills.slice(0, 3).map((skill: string, i: number) => (
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
                            {posts.map((post: any) => (
                                <Link
                                    key={post.id}
                                    href={`/posts/${post.id}`}
                                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center mb-3">
                                        <img
                                            src={post.user.image || "/default-avatar.png"}
                                            alt={post.user.name}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                        <span className="font-medium">{post.user.name}</span>
                                    </div>
                                    <p className="text-gray-800">{post.body || post.title}</p>
                                    {post.imageUrl && (
                                        <img
                                            src={post.imageUrl}
                                            alt="Post image"
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