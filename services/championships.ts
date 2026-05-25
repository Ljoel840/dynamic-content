// services/championships.ts

import { getApiUrl } from './apiConfig';

export interface Championship {
  id: string;
  name: string;
  sportId: string;
  country: string;
  type: 'Grupo' | 'Individual';
  season: string;
  status: 'Activo' | 'Inactivo';
}

const API_BASE = getApiUrl('championships/');

export const getChampionships = async (): Promise<Championship[]> => {
  const response = await fetch(`${API_BASE}getchampionships`);
  if (!response.ok) throw new Error('Failed to fetch championships');
  return response.json();
};

export const createChampionship = async (championship: Omit<Championship, 'id'>): Promise<Championship> => {
  const response = await fetch(`${API_BASE}addchampionshis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(championship),
  });
  if (!response.ok) throw new Error('Failed to create championship');
  return response.json();
};

export const updateChampionship = async (id: string, championship: Championship): Promise<Championship> => {
  const response = await fetch(`${API_BASE}updchampionships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      id: id, 
      championship: championship 
    }),
  });
  if (!response.ok) throw new Error('Failed to update championship');
  championship.id = id;
  return championship;
};

export const deleteChampionship = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}delchampionships`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete championship');
};