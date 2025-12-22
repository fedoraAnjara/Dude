// Sauvegarder le token
export function saveToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

// Récupérer le token
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Supprimer le token
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

// Vérifier si l'utilisateur est connecté
export function isAuthenticated() {
  return !!getToken();
}

// Faire une requête API avec le token
export async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
}