'use client';

import { getApiUrl } from './apiConfig';

export type AuthResponse = {
  token: string;
};

export type AuthError = {
  error: string;
};

const API_LOGIN = getApiUrl('webcontent/login');
const API_VALIDATE = getApiUrl('validatetoken/validate');

export async function login(username: string, password: string): Promise<AuthResponse> {
  const response = await globalThis.fetch(API_LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
   const data = await response.json();
  if (!response.ok) {
    //const errorData = (await response.json()) as AuthError;
    //throw new Error(errorData.error || 'Credenciales inválidas');
	throw new Error( 'Credenciales inválidas');
  }
  
  return data;
}

export async function validateSession(token: string): Promise<boolean> {
  /*const response = await globalThis.fetch(API_VALIDATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });
  console.log('Validate', response);
  if (!response.ok) {
    return false;
  }*/
  return true;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export function saveToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}
