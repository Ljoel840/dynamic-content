'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSlider, deleteSlider, getSliders, updateSlider, Slider, SliderType } from '../../services/sliders';

const sliderTypes: SliderType[] = ['Principal', 'Destacados Deportivos', 'Destacados Cine'];

export default function SlidersPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [form, setForm] = useState({ name: '', type: 'Principal' as SliderType });

  useEffect(() => {
    const loadSliders = async () => {
      const loaded = await getSliders();
      setSliders(loaded);
    };
    loadSliders();
  }, []);

  const resetForm = () => {
    setEditingSlider(null);
    setForm({ name: '', type: 'Principal' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert('Debe ingresar un nombre para el slider');
      return;
    }

    if (editingSlider) {
      const updated = await updateSlider(editingSlider.id, { name: form.name, type: form.type });
      setSliders(sliders.map((slider) => slider.id === updated.id ? updated : slider));
      resetForm();
      return;
    }

    const newSlider = await createSlider({ name: form.name, type: form.type });
    setSliders([...sliders, newSlider]);
    resetForm();
  };

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setForm({ name: slider.name, type: slider.type });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este slider y todas sus diapositivas?')) return;
    await deleteSlider(id);
    setSliders(sliders.filter((slider) => slider.id !== id));
    if (editingSlider?.id === id) resetForm();
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Gestión de Sliders</h1>
      <form onSubmit={handleSubmit} className="mb-8 max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre del Slider</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Slider</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as SliderType })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              {sliderTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">
            {editingSlider ? 'Actualizar Slider' : 'Crear Slider'}
          </button>
          {editingSlider && (
            <button type="button" onClick={resetForm} className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-400">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {sliders.length === 0 ? (
        <p>No hay sliders creados.</p>
      ) : (
        <div className="grid gap-4">
          {sliders.map((slider) => (
            <div key={slider.id} className="rounded border border-gray-300 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{slider.name}</h2>
                  <p className="text-sm text-gray-600">Tipo: {slider.type}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/sliders/${slider.id}`} className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-500">
                    Configurar slides
                  </Link>
                  <button onClick={() => handleEdit(slider)} className="rounded bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-400">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(slider.id)} className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
