'use client';

import { useState, useEffect } from 'react';
import { getChampionships, createChampionship, updateChampionship, deleteChampionship, Championship } from '../../services/championships';
import { getSports, Sport } from '../../services/sports';

export default function Leagues() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [editingChampionship, setEditingChampionship] = useState<Championship | null>(null);
  const [form, setForm] = useState({ name: '', sportId: '', country: '', type: 'Grupo' as 'Grupo' | 'Individual', season: '', status: 'Activo' as 'Activo' | 'Inactivo' });
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [championshipsData, sportsData] = await Promise.all([
          getChampionships(),
          getSports(),
        ]);
        setChampionships(championshipsData);
        setSports(sportsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to localStorage
        const storedChampionships = localStorage.getItem('championships');
        if (storedChampionships) {
          setChampionships(JSON.parse(storedChampionships));
        }
        const storedSports = localStorage.getItem('sports');
        if (storedSports) {
          setSports(JSON.parse(storedSports));
        }
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Note: Using API, no localStorage save
  }, [championships]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChampionship) {
        const updatedChampionship = await updateChampionship(editingChampionship.id, {
          id: editingChampionship.id,
          ...form,
        });
        setChampionships(championships.map(c => c.id === editingChampionship.id ? updatedChampionship : c));
        setEditingChampionship(null);
      } else {
        const newChampionship = await createChampionship(form);
        setChampionships([...championships, newChampionship]);
      }
      setForm({ name: '', sportId: '', country: '', type: 'Grupo', season: '', status: 'Activo' });
    } catch (error) {
      console.error('Failed to save championship:', error);
      alert('Error al guardar el campeonato');
    }
  };

  const handleEdit = (championship: Championship) => {
    setEditingChampionship(championship);
    setForm({ name: championship.name, sportId: championship.sportId, country: championship.country, type: championship.type, season: championship.season, status: championship.status });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChampionship(id);
      setChampionships(championships.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete championship:', error);
      alert('Error al eliminar el campeonato');
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Control de Campeonatos</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium">Nombre del Campeonato</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Deporte</label>
          <select
            value={form.sportId}
            onChange={(e) => setForm({ ...form, sportId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Seleccionar Deporte</option>
            {sports.map(sport => (
              <option key={sport.id} value={sport.id}>{sport.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">País</label>
          <input
            type="text"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Opcional"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Temporada</label>
          <input
            type="text"
            value={form.season}
            onChange={(e) => setForm({ ...form, season: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Ej: 2024"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Tipo</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as 'Grupo' | 'Individual' })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="Grupo">Grupo</option>
            <option value="Individual">Individual</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'Activo' | 'Inactivo' })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingChampionship ? 'Actualizar' : 'Agregar'} Campeonato
        </button>
        {editingChampionship && (
          <button type="button" onClick={() => { setEditingChampionship(null); setForm({ name: '', sportId: '', country: '', type: 'Grupo', season: '', status: 'Activo' }); }} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
            Cancelar
          </button>
        )}
      </form>
      <div className="mb-6 max-w-2xl">
        <label className="block text-sm font-medium">Buscar campeonato</label>
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Buscar por nombre"
        />
      </div>
      <ul className="space-y-4">
        {championships
          .filter((championship) => championship.name.toLowerCase().includes(filterName.toLowerCase()))
          .map(championship => (
          <li key={championship.id} className="border border-gray-300 rounded p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{championship.name}</h2>
              <p>Deporte: {sports.find(s => s.id === championship.sportId)?.name || 'Desconocido'}</p>
              <p>Tipo: {sports.find(s => s.id === championship.sportId)?.type || 'Desconocido'}</p>
              {championship.country && <p>País: {championship.country}</p>}
              <p>Temporada: {championship.season}</p>
              <p>Status: {championship.status}</p>
            </div>
            <div>
              <button onClick={() => handleEdit(championship)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Editar</button>
              <button onClick={() => handleDelete(championship.id)} className="bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}