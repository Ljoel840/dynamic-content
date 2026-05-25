// services/channels.ts

import { getApiUrl } from './apiConfig';

export interface Channel {
  id: string;
  description: string;
  channelNumber: number;
  hd: boolean;
  signalId: string;
  image: string;
  active: boolean;
}

const API_BASE = getApiUrl('channels/');

export const getChannels = async (): Promise<Channel[]> => {
  const response = await fetch(`${API_BASE}getchannel`);
  if (!response.ok) throw new Error('Failed to fetch channels');
  return response.json();
};

export const createChannel = async (channel: Omit<Channel, 'id'>): Promise<Channel> => {
  const response = await fetch(`${API_BASE}addchannel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel: channel }),
  });
  if (!response.ok) throw new Error('Failed to create channel');
  return response.json();
};

export const updateChannel = async (id: string, channel: Channel): Promise<Channel> => {
  const response = await fetch(`${API_BASE}updchannel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      id: id, 
      channel: channel 
    }),
  });
  if (!response.ok) throw new Error('Failed to update channel');
  channel.id = id;
  return channel/*response.json()*/;
};

export const deleteChannel = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to delete channel');
};