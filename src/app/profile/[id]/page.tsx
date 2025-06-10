"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { User, Mail, Briefcase, BookOpen, UserMinus, UserCheck, UserPlus } from "lucide-react";

type UserProfile = {
    id: string;
    name?: string;
    email: string;
    bio?: string;
    skills: string[];
    image?: string;
    experiences?: string[];
    educations?: string[];
    isFriend?: boolean;
};

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`/api/users/${userId}`);

            if (!res.ok) {
                throw new Error(res.status === 404 ? "Profil non trouvé" : "Erreur de chargement");
            }

            const data = await res.json();
            setProfile(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    // app/profile/[id]/page.tsx
    const handleFriendshipAction = async (action: "remove" | "add") => {
        try {
            setIsProcessing(true);
            setError(null);

            const res = await fetch("/api/friendships", {
                method: action === "remove" ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: profile?.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Action échouée");
            }

            // Recharger le profil pour mettre à jour le statut
            await fetchProfile();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                    <p className="font-bold">Erreur</p>
                    <p>{error}</p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retour à Accueil
                    </button>
                </div>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center py-10">Profil non trouvé</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* En-tête du profil */}
                    <div className="relative">
                        <div className="h-40 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg"></div>

                        <div className="px-8 pb-6 relative">
                            <div className="absolute -top-12 left-8">
                                {profile.image ? (
                                    <img
                                        src={profile.image}
                                        alt="Profil"
                                        className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                                        <User className="w-12 h-12 text-gray-500" />
                                    </div>
                                )}
                            </div>

                            <div className="pt-16 flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="w-32 pr-4 flex flex-col items-end border-r border-gray-200">
                                        <div className="text-right space-y-6">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Connections</span>
                                                <span className="text-lg font-bold text-blue-600">245</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vues</span>
                                                <span className="text-lg font-bold text-blue-600">1.2k</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-900">
                                            {profile.name || "Utilisateur"}
                                        </h1>

                                        <div className="mt-2 flex items-center text-gray-600">
                                            <Mail className="h-5 w-5 mr-2" />
                                            <span className="font-medium">{profile.email}</span>
                                        </div>

                                        {profile.bio && (
                                            <div className="mt-4">
                                                <p className="text-gray-700">{profile.bio}</p>
                                            </div>
                                        )}

                                        {profile.skills.length > 0 && (
                                            <div className="mt-4">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compétences</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.skills.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bouton d'action d'amitié */}
                                <div className="flex justify-end">
                                    {profile.isFriend ? (
                                        <button
                                            onClick={() => handleFriendshipAction("remove")}
                                            disabled={isProcessing}
                                            className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            <UserMinus className="h-5 w-5 mr-2" />
                                            {isProcessing ? "En cours..." : "Se désabonner"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFriendshipAction("add")}
                                            disabled={isProcessing}
                                            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <UserPlus className="h-5 w-5 mr-2" />
                                                    En cours...
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck className="h-5 w-5 mr-2" />
                                                    Suivre
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Expérience */}
                    {profile.experiences && profile.experiences.length > 0 && (
                        <div className="border-t border-gray-200 px-8 py-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <Briefcase className="h-5 w-5 mr-2" />
                                Expérience
                            </h3>
                            <div className="space-y-4">
                                {profile.experiences.map((exp, index) => (
                                    <div key={index} className="pl-7 relative">
                                        <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-blue-500"></div>
                                        <p className="text-gray-700">{exp}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section Formation */}
                    {profile.educations && profile.educations.length > 0 && (
                        <div className="border-t border-gray-200 px-8 py-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <BookOpen className="h-5 w-5 mr-2" />
                                Formation
                            </h3>
                            <div className="space-y-4">
                                {profile.educations.map((edu, index) => (
                                    <div key={index} className="pl-7 relative">
                                        <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-blue-500"></div>
                                        <p className="text-gray-700">{edu}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}