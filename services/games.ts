// services/games.ts

import { getApiUrl } from './apiConfig';
export interface Game {
  id: string;
  championshipId: string;
  channelIds: string[];
  team1Id: string;
  team2Id: string;
  date: string;
  time: string;
  place: string;
  detail?: string;
}

const API_BASE = getApiUrl('games/');

export const getGames = async (): Promise<Game[]> => {
  const response = await fetch(`${API_BASE}getgames`);
  if (!response.ok) throw new Error('Failed to fetch games');
  return response.json();
};

export const createGame = async (game: Omit<Game, 'id'>): Promise<Game> => {
  const response = await fetch(`${API_BASE}addgame`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game),
  });
  if (!response.ok) throw new Error('Failed to create game');
  return response.json();
};

export const updateGame = async (id: string, game: Game): Promise<Game> => {
  const response = await fetch(`${API_BASE}updateGame`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      id: id, 
      game: game 
    }),
  });
  if (!response.ok) throw new Error('Failed to update game');
  game.id = id;
  return game/*response.json()*/;
};

export const deleteGame = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete game');
};