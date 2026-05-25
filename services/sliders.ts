'use client';

export type SliderType = 'Principal' | 'Destacados Deportivos' | 'Destacados Cine';

export interface Slider {
  id: string;
  name: string;
  type: SliderType;
}

export interface Slide {
  id: string;
  sliderId: string;
  order: number;
  category: string;
  title: string;
  year?: number;
  duration?: string;
  description: string;
  date: string;
  time: string;
  publishStart: string;
  publishEnd: string;
  imagePc: string;
  imageMobile?: string;
  isMulti: boolean;
  url: string;
  channelIds: string[];
}

const STORAGE_SLIDERS = 'dynamic_sliders';
const STORAGE_SLIDES = 'dynamic_slides';

const readStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
};

const writeStorage = <T>(key: string, items: T[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(items));
};

const API_SLIDERS = '/api/sliders';
const API_SLIDES = '/api/slides';

const tryFetchJson = async (input: RequestInfo, init?: RequestInit) => {
  try {
    const res = await fetch(input, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
};

export const getSliders = async (): Promise<Slider[]> => {
  const remote = await tryFetchJson(API_SLIDERS);
  if (remote) return remote as Slider[];
  return readStorage<Slider>(STORAGE_SLIDERS);
};

export const getSlider = async (id: string): Promise<Slider | undefined> => {
  const remote = await tryFetchJson(`${API_SLIDERS}/${encodeURIComponent(id)}`);
  if (remote) return remote as Slider;
  return readStorage<Slider>(STORAGE_SLIDERS).find((slider) => slider.id === id);
};

export const createSlider = async (slider: Omit<Slider, 'id'>): Promise<Slider> => {
  const body = slider;
  const remote = await tryFetchJson(API_SLIDERS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (remote) return remote as Slider;

  const newSlider: Slider = { id: Date.now().toString(), ...slider };
  const sliders = readStorage<Slider>(STORAGE_SLIDERS);
  writeStorage(STORAGE_SLIDERS, [...sliders, newSlider]);
  return newSlider;
};

export const updateSlider = async (id: string, slider: Partial<Omit<Slider, 'id'>>): Promise<Slider> => {
  const remote = await tryFetchJson(`${API_SLIDERS}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slider),
  });
  if (remote) return remote as Slider;

  const sliders = readStorage<Slider>(STORAGE_SLIDERS);
  const updated = sliders.map((existing) => existing.id === id ? { ...existing, ...slider } : existing);
  writeStorage(STORAGE_SLIDERS, updated);
  return updated.find((s) => s.id === id)!;
};

export const deleteSlider = async (id: string): Promise<void> => {
  const remote = await tryFetchJson(`${API_SLIDERS}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (remote) return;

  const sliders = readStorage<Slider>(STORAGE_SLIDERS).filter((slider) => slider.id !== id);
  const slides = readStorage<Slide>(STORAGE_SLIDES).filter((slide) => slide.sliderId !== id);
  writeStorage(STORAGE_SLIDERS, sliders);
  writeStorage(STORAGE_SLIDES, slides);
};

export const getSlides = async (): Promise<Slide[]> => {
  const remote = await tryFetchJson(API_SLIDES);
  if (remote) return remote as Slide[];
  return readStorage<Slide>(STORAGE_SLIDES);
};

export const getSlidesBySliderId = async (sliderId: string): Promise<Slide[]> => {
  const remote = await tryFetchJson(`${API_SLIDES}?sliderId=${encodeURIComponent(sliderId)}`);
  if (remote) return remote as Slide[];
  return readStorage<Slide>(STORAGE_SLIDES).filter((slide) => slide.sliderId === sliderId);
};

export const createSlide = async (slide: Omit<Slide, 'id'>): Promise<Slide> => {
  const remote = await tryFetchJson(API_SLIDES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slide),
  });
  if (remote) return remote as Slide;

  const newSlide = { ...slide, id: Date.now().toString() };
  const slides = readStorage<Slide>(STORAGE_SLIDES);
  writeStorage(STORAGE_SLIDES, [...slides, newSlide]);
  return newSlide;
};

export const updateSlide = async (id: string, slide: Partial<Omit<Slide, 'id'>>): Promise<Slide> => {
  const remote = await tryFetchJson(`${API_SLIDES}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slide),
  });
  if (remote) return remote as Slide;

  const slides = readStorage<Slide>(STORAGE_SLIDES);
  const updatedSlides = slides.map((existing) => existing.id === id ? { ...existing, ...slide } as Slide : existing);
  writeStorage(STORAGE_SLIDES, updatedSlides);
  return updatedSlides.find((s) => s.id === id)!;
};

export const deleteSlide = async (id: string): Promise<void> => {
  const remote = await tryFetchJson(`${API_SLIDES}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (remote) return;

  const slides = readStorage<Slide>(STORAGE_SLIDES).filter((slide) => slide.id !== id);
  writeStorage(STORAGE_SLIDES, slides);
};
