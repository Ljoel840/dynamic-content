// services/sports.ts

import { getApiUrl } from './apiConfig';

export interface Sport {
  id: string;
  name: string;
  type: 'Grupo' | 'Individual';
}

const API_BASE = getApiUrl('sports/');

export const getSports = async (): Promise<Sport[]> => {
  const response = await fetch(`${API_BASE}getsports`);
  if (!response.ok) throw new Error('Failed to fetch sports');
  return response.json();
};

export const createSport = async (sport: Omit<Sport, 'id'>): Promise<Sport> => {
  const response = await fetch(`${API_BASE}addsports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sport),
  });
  if (!response.ok) throw new Error('Failed to create sport');
  return response.json();
};

export const updateSport = async (id: string, sport: Sport): Promise<Sport> => {
  const response = await fetch(`${API_BASE}updsports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: id,
      sport: sport
    }),
  });
  if (!response.ok) throw new Error('Failed to update sport');
  sport.id = id;
  return sport;
};

export const deleteSport = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete sport');
};