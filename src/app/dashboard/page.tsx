"use client";

import { useEffect, useState } from "react";
import { User, MoreHorizontal, ThumbsUp, MessageSquare, Share2, Image as ImageIcon } from "lucide-react";

import Navbar from "@/components/Navbar";

type Post = {
    id: number;
    title: string;
    body: string;
    likes: number;
    comments: number;
    time: string;
};

type Suggestion = {
    id: string;
    name: string;
    avatar: string;
    role: string;
};

export default function DashboardPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [newPost, setNewPost] = useState("");


    type RandomUserApiResponse = {
        results: {
            name: { first: string; last: string };
            picture: { thumbnail: string };
            login: { uuid: string };
        }[];
    };

    useEffect(() => {
        fetch("/api/posts")
            .then((res) => res.json())
            .then((data) => {
                const enhancedPosts = data.map((post: any) => ({
                    ...post,
                    likes: Math.floor(Math.random() * 100),
                    comments: Math.floor(Math.random() * 20),
                    time: `${Math.floor(Math.random() * 24)}h`
                }));
                setPosts(enhancedPosts);
            })
            .finally(() => setLoadingPosts(false));
    }, []);

    useEffect(() => {
        fetch("https://randomuser.me/api/?results=5&inc=name,picture,login")
            .then((res) => res.json())
            .then((data: RandomUserApiResponse) => {
                const roles = ["Développeur Fullstack", "UX Designer", "Product Manager", "Data Scientist", "Marketing Digital"];
                const users: Suggestion[] = data.results.map((user, index) => ({
                    id: user.login.uuid,
                    name: `${user.name.first} ${user.name.last}`,
                    avatar: user.picture.thumbnail,
                    role: roles[index % roles.length]
                }));
                setSuggestions(users);
            })
            .finally(() => setLoadingSuggestions(false));
    }, []);

    function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        if (!newPost.trim()) return;

        const post: Post = {
            id: posts.length + 1,
            title: "Nouvelle publication",
            body: newPost,
            likes: 0,
            comments: 0,
            time: "À l'instant"
        };

        setPosts([post, ...posts]);
        setNewPost("");
    }

    function handleLikePost(postId: number) {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
        ));
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation améliorée */}
            <Navbar />

            {/* Contenu principal */}
            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
                {/* Colonne principale - 2/3 de largeur */}
                <section className="lg:col-span-3 space-y-6">
                    {/* Création de post */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="text-blue-600" />
                                </div>
                                <textarea
                                    rows={3}
                                    placeholder="Partagez une publication..."
                                    className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    <ImageIcon className="h-5 w-5 mr-2" />
                                    Photo
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newPost.trim()}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Publier
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Liste des posts */}
                    {loadingPosts ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <article key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="font-semibold text-lg">{post.title}</h2>
                                                    <p className="text-sm text-gray-500">Utilisateur LinkedIn • {post.time}</p>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </div>
                                            <p className="mt-3 text-gray-800">{post.body}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Interactions */}
                                <div className="px-6 py-3 border-t border-gray-100">
                                    <div className="flex justify-between">
                                        <button
                                            onClick={() => handleLikePost(post.id)}
                                            className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-1 rounded"
                                        >
                                            <ThumbsUp className="h-5 w-5 mr-1" />
                                            {post.likes} Aimer
                                        </button>
                                        <button className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-1 rounded">
                                            <MessageSquare className="h-5 w-5 mr-1" />
                                            {post.comments} Commentaires
                                        </button>
                                        <button className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-1 rounded">
                                            <Share2 className="h-5 w-5 mr-1" />
                                            Partager
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </section>

                {/* Colonne de suggestions - 1/3 de largeur */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Suggestions de connexions</h3>

                        {loadingSuggestions ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {suggestions.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.role}</p>
                                            </div>
                                        </div>
                                        <button className="text-blue-600 text-sm font-medium hover:underline">
                                            Suivre
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section "Qui a consulté votre profil" */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Qui a consulté votre profil</h3>
                        <p className="text-gray-500 text-sm">12 personnes cette semaine</p>
                        <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                            Voir tous
                        </button>
                    </div>

                    {/* Section "Actualités" */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Actualités</h3>
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Les nouvelles tendances tech en 2023</p>
                            <p className="text-xs text-gray-500">2h • 125 lectures</p>

                            <p className="text-sm font-medium">Comment améliorer votre réseau professionnel</p>
                            <p className="text-xs text-gray-500">5h • 89 lectures</p>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

