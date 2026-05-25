// services/signals.ts

import { getApiUrl } from './apiConfig';

export interface Signal {
  id: string;
  description: string;
  active: boolean;
}

const API_BASE = getApiUrl('signals/getsignals');

export const getSignals = async (): Promise<Signal[]> => {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Failed to fetch signals');
  return response.json();
};

export const createSignal = async (signal: Omit<Signal, 'id'>): Promise<Signal> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signal),
  });
  if (!response.ok) throw new Error('Failed to create signal');
  return response.json();
};

export const updateSignal = async (id: string, signal: Partial<Omit<Signal, 'id'>>): Promise<Signal> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signal),
  });
  if (!response.ok) throw new Error('Failed to update signal');
  return response.json();
};

export const deleteSignal = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete signal');
};