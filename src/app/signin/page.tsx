"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import LogoLinkedIn from "../../components/LogoLinkedIn";

export default function SignIn() {
    const router = useRouter(); // ✅ utilisation correcte
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.ok) {
            router.push("/profile"); // ✅ redirection correcte
        } else {
            alert("Échec de connexion. Vérifie tes identifiants.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 p-6">
            <header className="w-full max-w-md mb-8">
                <LogoLinkedIn className="h-10 w-10" />
            </header>
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-semibold mb-6 text-center text-blue-700">
                    Connexion à LinkedIn
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="text-red-600 bg-red-100 p-2 rounded text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-md transition"
                    >
                        Se connecter
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Pas encore de compte ?{" "}
                    <a href="/signup" className="text-blue-700 hover:underline font-medium">
                        Inscrivez-vous
                    </a>
                </p>
            </div>
        </div>
    );
}
