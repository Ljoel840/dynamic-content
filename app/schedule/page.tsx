'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGames, Game } from '../../services/games';
import { getChampionships, Championship } from '../../services/championships';
import { getSports, Sport } from '../../services/sports';
import { getChannels, Channel } from '../../services/channels';
import { getTeams, Team } from '../../services/teams';

export default function Schedule() {
  const [games, setGames] = useState<Game[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', teamName: '', championshipId: '' });
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gamesData, championshipsData, sportsData, channelsData, teamsData] = await Promise.all([
          getGames(),
          getChampionships(),
          getSports(),
          getChannels(),
          getTeams(),
        ]);
        setGames(gamesData);
        setChampionships(championshipsData);
        setSports(sportsData);
        setChannels(channelsData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback
        const storedGames = localStorage.getItem('games');
        if (storedGames) {
          const parsedGames = JSON.parse(storedGames) as any[];
          setGames(parsedGames.map(game => ({
            ...game,
            channelIds: game.channelIds ?? (game.channelId ? [game.channelId] : []),
          })));
        }
        const storedChampionships = localStorage.getItem('championships');
        if (storedChampionships) {
          setChampionships(JSON.parse(storedChampionships));
        }
        const storedChannels = localStorage.getItem('channels');
        if (storedChannels) {
          setChannels(JSON.parse(storedChannels));
        }
        const storedTeams = localStorage.getItem('teams');
        if (storedTeams) {
          setTeams(JSON.parse(storedTeams));
        }
      }
    };
    loadData();
  }, []);

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Desconocido';
  const getTeamImage = (id: string) => teams.find(t => t.id === id)?.image || '';
  const getChampionshipName = (id: string) => championships.find(c => c.id === id)?.name || 'Desconocido';
  const getChampionshipType = (id: string) => {
    const championship = championships.find(c => c.id === id);
    if (!championship) return '';
    return sports.find(s => s.id === championship.sportId)?.type || '';
  };
  const getChannelNames = (ids: string[]) => ids.map(id => channels.find(channel => channel.id === id)?.description || 'Sin canal').join(', ');

  // Ordenar juegos por fecha
  const sortedGames = games.sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());

  // Filtrar juegos
  const filteredGames = sortedGames.filter(game => {
    const gameDate = new Date(game.date);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

    if (fromDate && gameDate < fromDate) return false;
    if (toDate && gameDate > toDate) return false;

    if (filters.teamName && !getTeamName(game.team1Id).toLowerCase().includes(filters.teamName.toLowerCase()) && !getTeamName(game.team2Id).toLowerCase().includes(filters.teamName.toLowerCase())) return false;

    if (filters.championshipId && game.championshipId !== filters.championshipId) return false;

    return true;
  });

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Listado de Juegos Programados</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Fecha Desde</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha Hasta</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nombre del Equipo</label>
            <input
              type="text"
              value={filters.teamName}
              onChange={(e) => setFilters({ ...filters, teamName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Buscar equipo..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Campeonato</label>
            <select
              value={filters.championshipId}
              onChange={(e) => setFilters({ ...filters, championshipId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Todos los Campeonatos</option>
              {championships.map(championship => (
                <option key={championship.id} value={championship.id}>{championship.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {filteredGames.length === 0 ? (
        <p>No hay juegos programados que coincidan con los filtros.</p>
      ) : (
        <ul className="space-y-4">
          {filteredGames.map(game => (
            <li key={game.id} className="border border-gray-300 rounded p-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                {getChampionshipType(game.championshipId) === 'Individual' ? (
                  <div className="mb-2">
                    <span className="text-lg font-semibold">{game.detail}</span>
                  </div>
                ) : (
                  <div className="flex items-center mb-2 gap-4">
                    {getTeamImage(game.team1Id) && <img src={getTeamImage(game.team1Id)} alt={getTeamName(game.team1Id)} className="w-12 h-12 rounded" />}
                    <span className="text-lg font-semibold">{getTeamName(game.team1Id)}</span>
                    <span className="mx-4">vs</span>
                    {getTeamImage(game.team2Id) && <img src={getTeamImage(game.team2Id)} alt={getTeamName(game.team2Id)} className="w-12 h-12 rounded" />}
                    <span className="text-lg font-semibold">{getTeamName(game.team2Id)}</span>
                  </div>
                )}
                <p>Campeonato: {getChampionshipName(game.championshipId)}</p>
                <p>Canales: {getChannelNames(game.channelIds)}</p>
                <p>Fecha: {game.date} a las {game.time}</p>
                <p>Lugar: {game.place}</p>
              </div>
              <div className="flex items-center justify-end">
                <button onClick={() => router.push(`/games?edit=${game.id}`)} className="bg-yellow-500 text-white px-3 py-1 rounded">Editar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}