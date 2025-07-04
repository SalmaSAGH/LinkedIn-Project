"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Image from "next/image";



type UserProfile = {
    id: string;
    name?: string;
    email: string;
    bio?: string;
    skills: string[];
    image?: string;
    experiences: string[];
    educations: string[];
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [skills, setSkills] = useState<string>("");
    const [image, setImage] = useState("");
    const [stats, setStats] = useState<{ postCount: number; connectionsCount: number } | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/profile/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des statistiques:", error);
            }
        }
        fetchStats();
    }, []);


    useEffect(() => {
        fetch("/api/profile")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch profile");
                return res.json();
            })
            .then((data) => {
                setProfile(data);
                setName(data.name ?? "");
                setBio(data.bio ?? "");
                setSkills((data.skills ?? []).join(", "));
                setImage(data.image ?? "");
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);

        const response = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, bio, skills: skillsArray, image }),
        });

        if (!response.ok) {
            setError("Failed to update profile");
        } else {
            const updated = await response.json();
            setProfile(updated);
            setError(null);
            alert("Profil mis à jour !");
        }
        setLoading(false);
    }

    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) setImage(reader.result.toString());
            };
            reader.readAsDataURL(file);
        }
    }

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Contenu principal */}
            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Section profil améliorée */}
                    <div className="relative">
                        {/* Bannière de fond */}
                        <div className="h-40 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg"></div>

                        {/* Photo de profil et informations */}
                        <div className="px-8 pb-6 relative">
                            <div className="absolute -top-12 left-8">
                                <div className="relative group">
                                    {image ? (
                                        <Image
                                            src={image}
                                            alt="Profil"
                                            width={40}
                                            height={40}
                                            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                                        />
                                    ) : (
                                        <div
                                            className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                                            <User className="w-12 h-12 text-gray-500" />
                                        </div>
                                    )}
                                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-16 flex">
                                {/* Nouvelle colonne de gauche pour remplir l'espace */}
                                <div className="w-32 pr-4 flex flex-col items-end border-r border-gray-200">
                                    <div className="text-right space-y-6">
                                        <div className="flex flex-col items-end">
                                            <span
                                                className="text-xs font-medium text-gray-500 uppercase tracking-wider">Connections</span>
                                            <span className="text-lg font-bold text-blue-600">
                {stats?.connectionsCount ?? "..."}
            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span
                                                className="text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</span>
                                            <span className="text-lg font-bold text-blue-600">
                {stats?.postCount ?? "..."}
            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne des informations (décalée à droite) */}
                                <div className="ml-6 flex-1">
                                    <div className="flex items-center space-x-4">
                                        <h1 className="text-3xl font-bold text-gray-900">
                                            {name || "Nom non défini"}
                                            <span className="ml-2 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </span>
                                        </h1>
                                    </div>

                                    <div className="mt-2 flex items-center text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                        <span className="font-medium">{profile?.email}</span>
                                    </div>

                                    <div className="mt-4 group">
                                        <div className="relative">
                                            <div
                                                className="absolute -left-4 top-0 h-full w-1 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className={`text-gray-700 pl-2 border-l-2 border-transparent group-hover:border-blue-200 transition-all ${!bio && "italic text-gray-400"}`}>
                                                {bio || "Ajoutez une bio pour décrire votre parcours et vos compétences..."}
                                            </p>
                                        </div>
                                    </div>

                                    {skills && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {skills.split(",").map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors duration-200"
                                                >
                {skill.trim()}
              </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <div className="border-t border-gray-200 px-6 py-4">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Compétences</label>
                                    <input
                                        type="text"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        placeholder="JavaScript, React, Node.js"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </span>
                                    ) : "Enregistrer les modifications"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
