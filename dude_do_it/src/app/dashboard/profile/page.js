'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, isAuthenticated } from '@/lib/authClient';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Formulaire de modification du profil
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Formulaire de changement d'email
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: ''
  });

  // Formulaire de changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadUser();
  }, [router]);

  const loadUser = async () => {
    try {
      const response = await fetchWithAuth('/api/auth/me');
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setProfileForm({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone
        });
        setEmailForm({
          email: data.user.email,
          password: ''
        });
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      const response = await fetchWithAuth('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
        setUser(data.user);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      const response = await fetchWithAuth('/api/auth/update-email', {
        method: 'PUT',
        body: JSON.stringify(emailForm)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Email mis à jour avec succès' });
        setUser(data.user);
        setEmailForm({ ...emailForm, password: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    setSaving(true);

    try {
      const response = await fetchWithAuth('/api/auth/update-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mon Profil
            </h1>
            <p className="text-gray-600">
              Gérez vos informations personnelles et paramètres de sécurité
            </p>
          </div>

          {/* Message de feedback */}
          {message.text && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Sidebar avec avatar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow p-6 sticky top-6">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                    {user?.firstName[0]}{user?.lastName[0]}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">{user?.email}</p>
                  
                <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center justify-between">
                    <span>Membre depuis</span>
                    <span className="font-medium text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                    </span>
                    </div>
                    <div className="flex items-center justify-between">
                    <span>Dernière modif.</span>
                    <span className="font-medium text-gray-900">
                        {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : '-'}
                    </span>
                    </div>
                </div>
                </div>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="md:col-span-2 space-y-6">
              {/* Informations personnelles */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Informations personnelles
                </h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </form>
              </div>

              {/* Changer l'email */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Changer l'adresse email
                </h3>
                
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouvelle adresse email
                    </label>
                    <input
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel (pour confirmer)
                    </label>
                    <input
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Mise à jour...' : 'Mettre à jour l\'email'}
                  </button>
                </form>
              </div>

              {/* Changer le mot de passe */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Changer le mot de passe
                </h3>
                
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Changement...' : 'Changer le mot de passe'}
                  </button>
                </form>
              </div>

              {/* Zone de danger */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-900 mb-4">
                  Zone de danger
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  La suppression de votre compte est irréversible. Toutes vos données seront définitivement perdues.
                </p>
                <button
                  onClick={() => alert('Fonctionnalité de suppression de compte à implémenter')}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}