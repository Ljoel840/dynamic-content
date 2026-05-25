'use client';

import { useState, useEffect } from 'react';

interface Championship {
  id: string;
  name: string;
  sportId: string;
  country: string;
  season: string;
  status: string;
}

interface Sport {
  id: string;
  name: string;
  type: 'Grupo' | 'Individual';
}

export default function LeaguesList() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);

  useEffect(() => {
    const storedChampionships = localStorage.getItem('championships');
    if (storedChampionships) {
      setChampionships(JSON.parse(storedChampionships));
    }
    const storedSports = localStorage.getItem('sports');
    if (storedSports) {
      setSports(JSON.parse(storedSports));
    }
  }, []);

  const getSportName = (id: string) => sports.find(s => s.id === id)?.name || 'Desconocido';
  const getSportType = (id: string) => sports.find(s => s.id === id)?.type || 'Desconocido';

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Listado de Campeonatos</h1>
      {championships.length === 0 ? (
        <p>No hay campeonatos registrados.</p>
      ) : (
        <ul className="space-y-4">
          {championships.map(championship => (
            <li key={championship.id} className="border border-gray-300 rounded p-4">
              <h2 className="text-lg font-semibold">{championship.name}</h2>
              <p>Deporte: {getSportName(championship.sportId)}</p>
              <p>Tipo: {getSportType(championship.sportId)}</p>
              <p>País: {championship.country}</p>
              <p>Temporada: {championship.season}</p>
              <p>Estado: {championship.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}