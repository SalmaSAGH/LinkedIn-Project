"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { User, Mail, Briefcase, BookOpen } from "lucide-react";

type UserProfile = {
    id: string;
    name?: string;
    email: string;
    bio?: string;
    skills: string[];
    image?: string;
    experiences?: string[];
    educations?: string[];
};

export default function UserProfilePage() {
    const params = useParams();
    const userId = params.id as string;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Profil non trouvé");
                return res.json();
            })
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [userId]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md mx-auto mt-10">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
        </div>
    );

    if (!profile) return <div className="text-center py-10">Profil non trouvé</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
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

                            <div className="pt-16 flex">
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

                                <div className="ml-6 flex-1">
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
                        </div>
                    </div>

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