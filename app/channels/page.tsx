'use client';

import { useState, useEffect } from 'react';
import { getChannels, createChannel, updateChannel, deleteChannel, Channel } from '../../services/channels';
import { getSignals, Signal } from '../../services/signals';

export default function Channels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [form, setForm] = useState({ description: '', channelNumber: '', hd: false, signalId: '', image: '', active: true });
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [channelsData, signalsData] = await Promise.all([
          getChannels(),
          getSignals(),
        ]);
        setChannels(channelsData);
        setSignals(signalsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback
        const storedChannels = localStorage.getItem('channels');
        if (storedChannels) {
          setChannels(JSON.parse(storedChannels));
        }
        const storedSignals = localStorage.getItem('signals');
        if (storedSignals) {
          setSignals(JSON.parse(storedSignals));
        }
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Using API
  }, [channels]);

  const handleImageFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.signalId) {
      alert('Seleccione una categoría para el canal');
      return;
    }
    try {
      if (editingChannel) {
        const updatedChannel = await updateChannel(editingChannel.id, {
          id: editingChannel.id,
          ...form,
          channelNumber: parseInt(form.channelNumber, 10) || 0,
        });
        setChannels(channels.map(channel => channel.id === editingChannel.id ? updatedChannel : channel));
        setEditingChannel(null);
      } else {
        const newChannel = await createChannel({
          ...form,
          channelNumber: parseInt(form.channelNumber, 10) || 0,
        });
        setChannels([...channels, newChannel]);
      }
      setForm({ description: '', channelNumber: '', hd: false, signalId: '', image: '', active: true });
    } catch (error) {
      console.error('Failed to save channel:', error);
      alert('Error al guardar el canal');
    }
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setForm({
      description: channel.description,
      channelNumber: channel.channelNumber.toString(),
      hd: channel.hd,
      signalId: channel.signalId,
      image: channel.image,
      active: channel.active,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChannel(id);
      setChannels(channels.filter(channel => channel.id !== id));
    } catch (error) {
      console.error('Failed to delete channel:', error);
      alert('Error al eliminar el canal');
    }
  };

  const getSignalName = (id: string) => signals.find(signal => signal.id === id)?.description || 'Sin categoría';

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Gestión de Canales</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium">Descripción</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Nombre del canal"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Canal de transmisión</label>
          <input
            type="number"
            value={form.channelNumber}
            onChange={(e) => setForm({ ...form, channelNumber: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Número del canal"
            required
          />
        </div>
        <div className="mb-4 flex items-center gap-3">
          <input
            id="channel-hd"
            type="checkbox"
            checked={form.hd}
            onChange={(e) => setForm({ ...form, hd: e.target.checked })}
            className="h-4 w-4"
          />
          <label htmlFor="channel-hd" className="text-sm font-medium">HD</label>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Categoría</label>
          <select
            value={form.signalId}
            onChange={(e) => setForm({ ...form, signalId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Seleccionar Categoría</option>
            {signals.map(signal => (
              <option key={signal.id} value={signal.id}>{signal.description}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Logo del Canal</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full"
          />
          {form.image && <img src={form.image} alt="Logo del canal" className="mt-2 h-24 w-24 object-contain rounded border" />}
        </div>
        <div className="mb-4 flex items-center gap-3">
          <input
            id="channel-active"
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4"
          />
          <label htmlFor="channel-active" className="text-sm font-medium">Activo</label>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingChannel ? 'Actualizar' : 'Agregar'} Canal
        </button>
        {editingChannel && (
          <button type="button" onClick={() => { setEditingChannel(null); setForm({ description: '', channelNumber: '', hd: false, signalId: '', image: '', active: true }); }} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
            Cancelar
          </button>
        )}
      </form>
      <div className="mb-6 max-w-2xl">
        <label className="block text-sm font-medium">Buscar canal</label>
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Buscar por nombre"
        />
      </div>
      {channels.length === 0 ? (
        <p>No hay canales registrados.</p>
      ) : (
        <ul className="space-y-4">
          {channels
            .filter((channel) => channel.description.toLowerCase().includes(filterName.toLowerCase()))
            .map(channel => (
            <li key={channel.id} className="border border-gray-300 rounded p-4 flex justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold">{channel.description}</h2>
                <p>Canal: {channel.channelNumber}</p>
                <p>HD: {channel.hd ? 'Sí' : 'No'}</p>
                <p>Categoría: {getSignalName(channel.signalId)}</p>
                <p>Status: {channel.active ? 'Activo' : 'Inactivo'}</p>
              </div>
              {channel.image && <img src={channel.image} alt={channel.description} className="h-20 w-20 object-contain rounded border" />}
              <div>
                <button onClick={() => handleEdit(channel)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Editar</button>
                <button onClick={() => handleDelete(channel.id)} className="bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
