'use client';

import { useState, type ReactNode } from 'react';

export default function MobileMenu({
  children,
  onLogout,
}: {
  children: ReactNode;
  onLogout?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full flex flex-col md:flex-row">
      <div className="md:hidden bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <span className="text-xl font-bold">Menú</span>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center justify-center rounded bg-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-600"
        >
          {menuOpen ? 'Cerrar' : 'Abrir'}
        </button>
      </div>

      <aside className={`w-full md:w-64 bg-gray-800 text-white p-4 ${menuOpen ? 'block' : 'hidden'} md:block`}>
        <div className="hidden md:block mb-4">
          <h2 className="text-xl font-bold">Menú</h2>
        </div>
        <div className="flex items-center justify-between mb-4 md:hidden">
          <h2 className="text-xl font-bold">Navegación</h2>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center rounded bg-gray-700 px-2 py-1 text-sm font-medium hover:bg-gray-600"
          >
            X
          </button>
        </div>
        <ul className="flex flex-wrap gap-2 md:block">
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/" className="block p-2 rounded hover:bg-gray-700">Gestionar Equipos</a>
          </li>
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/teams-championship" className="block p-2 rounded hover:bg-gray-700">Asignar Equipos a Campeonato</a>
          </li>
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/leagues" className="block p-2 rounded hover:bg-gray-700">Gestionar Campeonatos</a>
          </li>
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/sports" className="block p-2 rounded hover:bg-gray-700">Gestionar Deportes</a>
          </li>
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/signals" className="block p-2 rounded hover:bg-gray-700">Gestionar Categorías</a>
          </li>
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/channels" className="block p-2 rounded hover:bg-gray-700">Gestionar Canales</a>
          </li>
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/sliders" className="block p-2 rounded hover:bg-gray-700">Gestionar Sliders</a>
          </li>
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/games" className="block p-2 rounded hover:bg-gray-700">Programar Juegos</a>
          </li>
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/teams-list" className="block p-2 rounded hover:bg-gray-700">Ver Equipos</a>
          </li>
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/leagues-list" className="block p-2 rounded hover:bg-gray-700">Ver Campeonatos</a>
          </li>
          <li className="mb-0 md:mb-2 w-full md:w-auto">
            <a href="/schedule" className="block p-2 rounded hover:bg-gray-700">Ver Juegos</a>
          </li>
          {onLogout && (
            <li className="mt-2 w-full md:mt-4 md:w-auto">
              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded bg-red-600 px-3 py-2 text-left text-sm font-medium text-white hover:bg-red-500"
              >
                Cerrar sesión
              </button>
            </li>
          )}
        </ul>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
