// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import LogoLinkedIn from '../components/LogoLinkedIn';

export default function Home() {
  const router = useRouter();

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <LogoLinkedIn className="w-16 h-16 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur LinkedIn Project</h1>
        <p className="text-lg mb-8">Connectez-vous ou créez un compte pour commencer</p>
        <div className="flex space-x-4">
          <button
              onClick={() => router.push('/signin')}
              className="bg-white text-blue-700 font-semibold px-6 py-2 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer"
          >
            Connexion
          </button>
          <button
              onClick={() => router.push('/signup')}
              className="bg-white text-blue-700 font-semibold px-6 py-2 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer"
          >
            Inscription
          </button>
        </div>
      </div>
  );
}
