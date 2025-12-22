'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/authClient';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Dude Do It
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Gérez vos projets et tickets efficacement
          </p>
          
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Créer un compte
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">Projets</h3>
            <p className="text-gray-600">
              Créez et gérez plusieurs projets en toute simplicité
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎫</div>
            <h3 className="text-xl font-bold mb-2">Tickets</h3>
            <p className="text-gray-600">
              Suivez vos tâches avec des tickets détaillés
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Équipe</h3>
            <p className="text-gray-600">
              Collaborez avec votre équipe en temps réel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}