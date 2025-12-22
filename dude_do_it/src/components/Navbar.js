'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { removeToken } from '@/lib/authClient';

export default function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
            Dude Do It
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/projects"
              className="text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              Projets
            </Link>
            <Link
              href="/dashboard/tickets"
              className="text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              Tickets
            </Link>

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}