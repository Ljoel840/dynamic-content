'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getChannels, Channel } from '../../../services/channels';
import {
  createSlide,
  deleteSlide,
  getSlider,
  getSlidesBySliderId,
  Slide,
  Slider,
  updateSlide,
} from '../../../services/sliders';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

const buildSlideTemplate = (sliderId: string, currentDate: string, currentTime: string): Slide => ({
  id: '',
  sliderId,
  order: 1,
  category: '',
  title: '',
  year: undefined,
  duration: '',
  description: '',
  date: currentDate,
  time: currentTime,
  publishStart: '',
  publishEnd: '',
  imagePc: '',
  imageMobile: '',
  isMulti: false,
  url: '',
  channelIds: [],
});

export default function SliderConfigPage() {
  const params = useParams();
  const sliderId = params?.sliderId as string;
  const [slider, setSlider] = useState<Slider | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filter, setFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [form, setForm] = useState<Slide | null>(null);

  useEffect(() => {
    const now = new Date();
    const formattedDate = formatDate(now);
    const formattedTime = formatTime(now);
    setCurrentDate(formattedDate);
    setCurrentTime(formattedTime);
  }, []);

  useEffect(() => {
    if (!sliderId || !currentDate || !currentTime) return;
    const loadSliderData = async () => {
      const foundSlider = await getSlider(sliderId);
      const sliderSlides = await getSlidesBySliderId(sliderId);
      setSlider(foundSlider ?? null);
      setSlides(sliderSlides);
      setForm(buildSlideTemplate(sliderId, currentDate, currentTime));
    };
    loadSliderData();
  }, [sliderId, currentDate, currentTime]);

  useEffect(() => {
    const loadChannels = async () => {
      try {
        setChannels(await getChannels());
      } catch {
        const storedChannels = window.localStorage.getItem('channels');
        if (storedChannels) {
          setChannels(JSON.parse(storedChannels));
        }
      }
    };
    loadChannels();
  }, []);

  const resetForm = () => {
    if (!sliderId || !currentDate || !currentTime) return;
    setEditingSlide(null);
    setForm(buildSlideTemplate(sliderId, currentDate, currentTime));
  };

  const isPrincipal = slider?.type === 'Principal';
  const isSportFeatured = slider?.type === 'Destacados Deportivos';
  const isCinemaFeatured = slider?.type === 'Destacados Cine';
  const showYearAndDuration = isCinemaFeatured;
  const showChannels = slider ? !isPrincipal : false;
  const showMobileImage = slider ? isPrincipal : false;

  const filteredSlides = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return slides
      .slice()
      .sort((a, b) => a.order - b.order)
      .filter((slide) =>
        !term ||
        slide.title.toLowerCase().includes(term) ||
        slide.category.toLowerCase().includes(term) ||
        slide.url.toLowerCase().includes(term)
      );
  }, [filter, slides]);

  const filteredChannels = useMemo(() => {
    const term = channelFilter.trim().toLowerCase();
    return channels.filter((channel) =>
      !term ||
      channel.description.toLowerCase().includes(term) ||
      channel.channelNumber.toString().includes(term) ||
      channel.hd.toString().toLowerCase().includes(term)
    );
  }, [channelFilter, channels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !slider) return;

    if (!form.category.trim() || !form.title.trim()) {
      alert('Debe completar categoría y título.');
      return;
    }

    if (!form.publishStart || !form.publishEnd) {
      alert('Debe completar las fechas de publicación.');
      return;
    }

    if (!form.imagePc.trim()) {
      alert('Debe seleccionar o cargar una imagen para PC.');
      return;
    }

    const normalizedSlide: Omit<Slide, 'id'> = {
      ...form,
      year: showYearAndDuration ? form.year : undefined,
      duration: showYearAndDuration ? form.duration : undefined,
      imageMobile: showMobileImage ? form.imageMobile : undefined,
      channelIds: showChannels ? form.channelIds : ([] as string[]),
      sliderId,
      date: form.date,
      time: form.time,
    };

    if (editingSlide) {
      const updated = await updateSlide(editingSlide.id, normalizedSlide);
      setSlides(slides.map((slide) => slide.id === updated.id ? updated : slide));
      resetForm();
      return;
    }

    const created = await createSlide(normalizedSlide);
    setSlides([...slides, created]);
    resetForm();
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setForm(slide);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta diapositiva?')) return;
    await deleteSlide(id);
    setSlides(slides.filter((slide) => slide.id !== id));
    if (editingSlide?.id === id) resetForm();
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>, field: 'imagePc' | 'imageMobile') => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => prev ? { ...prev, [field]: reader.result as string } : prev);
    };
    reader.readAsDataURL(file);
  };

  const getChannelNames = (ids: string[]) => ids.map((id) => channels.find((channel) => channel.id === id)?.description || 'Sin canal').join(', ');

  if (!slider) {
    return (
      <div className="p-4 sm:p-8">
        <div className="mb-4 rounded border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
          Slider no encontrado o no existe.
        </div>
        <Link href="/sliders" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">
          Volver a Sliders
        </Link>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Slides de {slider.name}</h1>
          <p className="text-sm text-gray-600">Tipo de slider: {slider.type}</p>
        </div>
        <Link href="/sliders" className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600">
          Volver a Sliders
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mb-10 rounded border border-gray-300 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Orden</label>
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {showYearAndDuration && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Año</label>
                <input
                  type="number"
                  value={form.year ?? ''}
                  onChange={(e) => setForm({ ...form, year: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duración</label>
                <input
                  type="text"
                  placeholder="HH:mm"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha</label>
            <input
              type="date"
              value={form.date}
              disabled
              className="mt-1 block w-full cursor-not-allowed border border-gray-300 rounded-md bg-gray-100 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Hora</label>
            <input
              type="time"
              value={form.time}
              disabled
              className="mt-1 block w-full cursor-not-allowed border border-gray-300 rounded-md bg-gray-100 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Comienzo de Publicación</label>
            <input
              type="datetime-local"
              value={form.publishStart}
              onChange={(e) => setForm({ ...form, publishStart: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fin de Publicación</label>
            <input
              type="datetime-local"
              value={form.publishEnd}
              onChange={(e) => setForm({ ...form, publishEnd: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Imagen para PC</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInput(e, 'imagePc')}
              className="mt-1 block w-full text-sm text-gray-700"
            />
            <input
              type="text"
              placeholder="URL de imagen PC"
              value={form.imagePc}
              onChange={(e) => setForm({ ...form, imagePc: e.target.value })}
              className="mt-2 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {showMobileImage && (
            <div>
              <label className="block text-sm font-medium mb-2">Imagen para Móvil</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileInput(e, 'imageMobile')}
                className="mt-1 block w-full text-sm text-gray-700"
              />
              <input
                type="text"
                placeholder="URL de imagen móvil"
                value={form.imageMobile ?? ''}
                onChange={(e) => setForm({ ...form, imageMobile: e.target.value })}
                className="mt-2 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Es Multi</label>
            <select
              value={form.isMulti ? 'true' : 'false'}
              onChange={(e) => setForm({ ...form, isMulti: e.target.value === 'true' })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          {showChannels && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">Canales de transmisión</label>
              <input
                type="text"
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                placeholder="Buscar canal por nombre, número o HD"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
              <div className="mt-3 grid gap-2 max-h-72 overflow-y-auto border border-gray-300 rounded-md p-2">
                {filteredChannels.length === 0 ? (
                  <p className="text-sm text-gray-500">No se encontraron canales.</p>
                ) : (
                  filteredChannels.map((channel) => (
                    <label key={channel.id} className="flex items-center gap-3 rounded border p-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.channelIds.includes(channel.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((current) => {
                            if (!current) return null;
                            return {
                              ...current,
                              channelIds: checked
                                ? [...current.channelIds, channel.id]
                                : current.channelIds.filter((id) => id !== channel.id),
                            };
                          });
                        }}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{channel.description}</span>
                          <span className="text-xs text-gray-500">#{channel.channelNumber}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
                          <span>{channel.hd ? 'HD' : 'SD'}</span>
                          <span>{channel.active ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">
            {editingSlide ? 'Actualizar Slide' : 'Crear Slide'}
          </button>
          <button type="button" onClick={resetForm} className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-400">
            Limpiar formulario
          </button>
        </div>
      </form>

      <section className="rounded border border-gray-300 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Slides</h2>
            <p className="text-sm text-gray-600">Filtra por título, categoría o URL.</p>
          </div>
          <div className="w-full sm:w-80">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar slides..."
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        {filteredSlides.length === 0 ? (
          <p>No hay slides para este slider.</p>
        ) : (
          <div className="space-y-4">
            {filteredSlides.map((slide) => (
              <div key={slide.id} className="rounded border border-gray-200 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span>Orden: {slide.order}</span>
                      <span>Categoría: {slide.category}</span>
                      <span>Multi: {slide.isMulti ? 'Sí' : 'No'}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{slide.title}</h3>
                    <p className="text-sm text-gray-600">{slide.description}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <p>Fecha/Hora: {slide.date} {slide.time}</p>
                      <p>Publicación: {slide.publishStart} ➜ {slide.publishEnd}</p>
                      {showYearAndDuration && <p>Año: {slide.year ?? '—'}</p>}
                      {showYearAndDuration && <p>Duración: {slide.duration || '—'}</p>}
                      {showChannels && <p>Canales: {getChannelNames(slide.channelIds) || 'Sin canales'}</p>}
                      <p>URL: {slide.url || 'Sin URL'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <button onClick={() => handleEdit(slide)} className="rounded bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-400">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(slide.id)} className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500">
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold mb-1">Imagen PC</p>
                    {slide.imagePc ? <img src={slide.imagePc} alt={slide.title} className="h-40 w-full object-contain rounded border" /> : <p className="text-sm text-gray-500">No hay imagen PC</p>}
                  </div>
                  {showMobileImage && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Imagen Móvil</p>
                      {slide.imageMobile ? <img src={slide.imageMobile} alt={`${slide.title} móvil`} className="h-40 w-full object-contain rounded border" /> : <p className="text-sm text-gray-500">No hay imagen móvil</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
