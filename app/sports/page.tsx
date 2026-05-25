'use client';

import { useState, useEffect } from 'react';
import { getSports, createSport, updateSport, deleteSport, Sport } from '../../services/sports';

export default function Sports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [form, setForm] = useState({ name: '', type: 'Grupo' as 'Grupo' | 'Individual' });
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const sportsData = await getSports();
        setSports(sportsData);
      } catch (error) {
        console.error('Failed to load sports:', error);
        const storedSports = localStorage.getItem('sports');
        if (storedSports) {
          setSports(JSON.parse(storedSports));
        }
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Using API
  }, [sports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSport) {
        const updatedSport = await updateSport(editingSport.id, {
          id: editingSport.id,
          ...form,
        });
        setSports(sports.map(s => s.id === editingSport.id ? updatedSport : s));
        setEditingSport(null);
      } else {
        const newSport = await createSport(form);
        setSports([...sports, newSport]);
      }
      setForm({ name: '', type: 'Grupo' });
    } catch (error) {
      console.error('Failed to save sport:', error);
      alert('Error al guardar el deporte');
    }
  };

  const handleEdit = (sport: Sport) => {
    setEditingSport(sport);
    setForm({ name: sport.name, type: sport.type });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSport(id);
      setSports(sports.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete sport:', error);
      alert('Error al eliminar el deporte');
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Gestionar Deportes</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium">Nombre del Deporte</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingSport ? 'Actualizar' : 'Agregar'} Deporte
        </button>
        {editingSport && (
          <button type="button" onClick={() => { setEditingSport(null); setForm({ name: '', type: 'Grupo' }); }} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
            Cancelar
          </button>
        )}
      </form>
      <div className="mb-6 max-w-2xl">
        <label className="block text-sm font-medium">Buscar deporte</label>
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Buscar por nombre"
        />
      </div>
      <ul className="space-y-4">
        {sports
          .filter((sport) => sport.name.toLowerCase().includes(filterName.toLowerCase()))
          .map(sport => (
          <li key={sport.id} className="border border-gray-300 rounded p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{sport.name}</h2>
              <p>Tipo: {sport.type}</p>
            </div>
            <div>
              <button onClick={() => handleEdit(sport)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Editar</button>
              <button onClick={() => handleDelete(sport.id)} className="bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}