// services/teams.ts

import { getApiUrl } from './apiConfig';

export interface Team {
  id: string;
  name: string;
  city: string;
  founded: number;
  image: string;
}

const API_BASE = getApiUrl('teams/');

export const getTeams = async (): Promise<Team[]> => {
  const response = await fetch(`${API_BASE}getteams`);
  if (!response.ok) throw new Error('Failed to fetch teams');
  return response.json();
};

export const createTeam = async (team: Omit<Team, 'id'>): Promise<Team> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(team),
  });
  if (!response.ok) throw new Error('Failed to create team');
  return response.json();
};

export const updateTeam = async (id: string, team: Omit<Team, 'id'>): Promise<Team> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(team),
  });
  if (!response.ok) throw new Error('Failed to update team');
  return response.json();
};

export const deleteTeam = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete team');
};