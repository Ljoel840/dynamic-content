'use client';

import { useState, useEffect } from 'react';
import { getSignals, createSignal, updateSignal, deleteSignal, Signal } from '../../services/signals';

export default function Signals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null);
  const [form, setForm] = useState({ description: '', active: true });
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const signalsData = await getSignals();
        setSignals(signalsData);
      } catch (error) {
        console.error('Failed to load signals:', error);
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
  }, [signals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSignal) {
        const updatedSignal = await updateSignal(editingSignal.id, form);
        setSignals(signals.map(signal => signal.id === editingSignal.id ? updatedSignal : signal));
        setEditingSignal(null);
      } else {
        const newSignal = await createSignal(form);
        setSignals([...signals, newSignal]);
      }
      setForm({ description: '', active: true });
    } catch (error) {
      console.error('Failed to save signal:', error);
      alert('Error al guardar la categoría');
    }
  };

  const handleEdit = (signal: Signal) => {
    setEditingSignal(signal);
    setForm({ description: signal.description, active: signal.active });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSignal(id);
      setSignals(signals.filter(signal => signal.id !== id));
    } catch (error) {
      console.error('Failed to delete signal:', error);
      alert('Error al eliminar la categoría');
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Gestión de Categorías</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium">Descripción</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Nombre de la categoría"
            required
          />
        </div>
        <div className="mb-4 flex items-center gap-3">
          <input
            id="signal-active"
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4"
          />
          <label htmlFor="signal-active" className="text-sm font-medium">Activa</label>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingSignal ? 'Actualizar' : 'Agregar'} Categoría
        </button>
        {editingSignal && (
          <button type="button" onClick={() => { setEditingSignal(null); setForm({ description: '', active: true }); }} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
            Cancelar
          </button>
        )}
      </form>
      <div className="mb-6 max-w-2xl">
        <label className="block text-sm font-medium">Buscar categoría</label>
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Buscar por nombre"
        />
      </div>
      {signals.filter((signal) => signal.description.toLowerCase().includes(filterName.toLowerCase())).length === 0 ? (
        <p>No hay categorías registradas.</p>
      ) : (
        <ul className="space-y-4">
          {signals
            .filter((signal) => signal.description.toLowerCase().includes(filterName.toLowerCase()))
            .map(signal => (
            <li key={signal.id} className="border border-gray-300 rounded p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{signal.description}</h2>
                <p>Status: {signal.active ? 'Activo' : 'Inactivo'}</p>
              </div>
              <div>
                <button onClick={() => handleEdit(signal)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Editar</button>
                <button onClick={() => handleDelete(signal.id)} className="bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
