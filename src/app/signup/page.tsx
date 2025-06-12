'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LogoLinkedIn from "../../components/LogoLinkedIn";

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                body: JSON.stringify(form),
                headers: { 'Content-Type': 'application/json' },
            });

            let data;
            try {
                data = await res.json(); // on essaie de parser le JSON quelle que soit la réponse
            } catch (err) {
                console.error('Erreur JSON :', err);
                setError("Erreur inattendue");
                return;
            }

            if (!res.ok) {
                setError(data.error || 'Erreur');
                return;
            }

            router.push('/signin');
        } catch (err) {
            console.error("Erreur réseau : ", err);
            setError("Erreur réseau");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <header className="w-full max-w-md mb-8">
                <LogoLinkedIn className="h-10 w-10"/>
            </header>
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Créer un compte</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Nom"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition cursor-pointer"
                    >
                        Inscrivez-vous
                    </button>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                </form>
                <p className="text-center text-sm mt-4">
                    Déjà inscrit ? <a href="/signin" className="text-blue-600 hover:underline">Connexion</a>
                </p>
            </div>
        </div>
    );
}
