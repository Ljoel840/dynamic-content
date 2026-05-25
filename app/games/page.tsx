'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getGames, createGame, updateGame, deleteGame, Game } from '../../services/games';
import { getChampionships, Championship } from '../../services/championships';
import { getSports, Sport } from '../../services/sports';
import { getChannels, Channel } from '../../services/channels';
import { getTeams, Team } from '../../services/teams';
import { getTeamChampionshipAssignments, TeamChampionshipAssignment } from '../../services/teamChampionships';

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [assignments, setAssignments] = useState<TeamChampionshipAssignment[]>([]);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [form, setForm] = useState({ championshipId: '', channelIds: [] as string[], date: '', time: '', place: '', detail: '' });
  const [championshipFilter, setChampionshipFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [selectedTeam1Id, setSelectedTeam1Id] = useState<string>('');
  const [selectedTeam2Id, setSelectedTeam2Id] = useState<string>('');
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      const [gamesResult, championshipsResult, sportsResult, channelsResult, teamsResult, assignmentsResult] = await Promise.allSettled([
        getGames(),
        getChampionships(),
        getSports(),
        getChannels(),
        getTeams(),
        getTeamChampionshipAssignments(),
      ]);

      if (gamesResult.status === 'fulfilled') {
        setGames(gamesResult.value);
      } else {
        console.error('Failed to load games:', gamesResult.reason);
        const storedGames = localStorage.getItem('games');
        if (storedGames) {
          const parsedGames = JSON.parse(storedGames) as any[];
          setGames(parsedGames.map(game => ({
            ...game,
            channelIds: game.channelIds ?? (game.channelId ? [game.channelId] : []),
          })));
        }
      }

      if (championshipsResult.status === 'fulfilled') {
        setChampionships(championshipsResult.value);
      } else {
        console.error('Failed to load championships:', championshipsResult.reason);
        const storedChampionships = localStorage.getItem('championships');
        if (storedChampionships) {
          setChampionships(JSON.parse(storedChampionships));
        }
      }

      if (sportsResult.status === 'fulfilled') {
        setSports(sportsResult.value);
      } else {
        console.error('Failed to load sports:', sportsResult.reason);
      }

      if (channelsResult.status === 'fulfilled') {
        setChannels(channelsResult.value);
      } else {
        console.error('Failed to load channels:', channelsResult.reason);
        const storedChannels = localStorage.getItem('channels');
        if (storedChannels) {
          setChannels(JSON.parse(storedChannels));
        }
      }

      if (teamsResult.status === 'fulfilled') {
        setTeams(teamsResult.value);
      } else {
        console.error('Failed to load teams:', teamsResult.reason);
        const storedTeams = localStorage.getItem('teams');
        if (storedTeams) {
          setTeams(JSON.parse(storedTeams));
        }
      }

      if (assignmentsResult.status === 'fulfilled') {
        setAssignments(assignmentsResult.value);
      } else {
        console.error('Failed to load assignments:', assignmentsResult.reason);
        const storedAssignments = localStorage.getItem('teamChampionshipAssignments');
        if (storedAssignments) {
          setAssignments(JSON.parse(storedAssignments));
        }
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Note: Since we are using API, we don't save to localStorage anymore
    // If needed, we can add a save to localStorage here for offline support
  }, [games]);

  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  useEffect(() => {
    if (!editingGame && editId && games.length && teams.length && championships.length && channels.length) {
      const gameToEdit = games.find((game) => game.id === editId);
      if (gameToEdit) {
        setEditingGame(gameToEdit);
        setForm({ championshipId: gameToEdit.championshipId, channelIds: gameToEdit.channelIds, date: gameToEdit.date, time: gameToEdit.time, place: gameToEdit.place, detail: gameToEdit.detail || '' });
        setSelectedTeam1Id(gameToEdit.team1Id);
        setSelectedTeam2Id(gameToEdit.team2Id);
      }
    }
  }, [editId, editingGame, games, teams, championships, channels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const championshipType = getChampionshipType(form.championshipId);
    if (form.channelIds.length === 0) {
      alert('Debe seleccionar al menos un canal de transmisión');
      return;
    }
    if (championshipType === 'Individual') {
      if (!form.detail.trim()) {
        alert('Debe ingresar un detalle para juegos individuales');
        return;
      }
    } else {
      if (!selectedTeam1Id || !selectedTeam2Id) {
        alert('Debe seleccionar dos equipos');
        return;
      }
    }
    try {
      if (editingGame) {
        const updatedGame = await updateGame(editingGame.id, {
          id: editingGame.id,
          championshipId: form.championshipId,
          channelIds: form.channelIds,
          team1Id: selectedTeam1Id,
          team2Id: selectedTeam2Id,
          date: form.date,
          time: form.time,
          place: form.place,
          detail: form.detail,
        });
        setGames(games.map(g => g.id === editingGame.id ? updatedGame : g));
        setEditingGame(null);
      } else {
        const newGame = await createGame({
          championshipId: form.championshipId,
          channelIds: form.channelIds,
          team1Id: selectedTeam1Id,
          team2Id: selectedTeam2Id,
          date: form.date,
          time: form.time,
          place: form.place,
          detail: form.detail,
        });
        setGames([...games, newGame]);
      }
      setForm({ championshipId: '', channelIds: [], date: '', time: '', place: '', detail: '' });
      setSelectedTeam1Id('');
      setSelectedTeam2Id('');
    } catch (error) {
      console.error('Failed to save game:', error);
      alert('Error al guardar el juego');
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setForm({ championshipId: game.championshipId, channelIds: game.channelIds, date: game.date, time: game.time, place: game.place, detail: game.detail || '' });
    setSelectedTeam1Id(game.team1Id);
    setSelectedTeam2Id(game.team2Id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGame(id);
      setGames(games.filter(g => g.id !== id));
    } catch (error) {
      console.error('Failed to delete game:', error);
      alert('Error al eliminar el juego');
    }
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Desconocido';
  const getChampionshipName = (id: string) => championships.find(c => c.id === id)?.name || 'Desconocido';
  const getChampionshipType = (id: string) => {
    const championship = championships.find(c => c.id === id);
    if (!championship) return '';
    return sports.find(s => s.id === championship.sportId)?.type || '';
  };
  const getChannelNames = (ids: string[]) => ids.map(id => channels.find(channel => channel.id === id)?.description || 'Sin canal').join(', ');

  const filteredChannels = channels.filter(channel =>
    channel.description.toLowerCase().includes(channelFilter.toLowerCase()) ||
    channel.channelNumber.toString().includes(channelFilter) ||
    channel.hd.toString().toLowerCase().includes(channelFilter.toLowerCase())
  );

  const teamsInChampionship = teams.filter(t => assignments.some(a => a.teamId === t.id && a.championshipId === form.championshipId));

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Programar Juegos</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium">Buscar campeonato</label>
          <input
            type="text"
            value={championshipFilter}
            onChange={(e) => setChampionshipFilter(e.target.value)}
            placeholder="Filtrar campeonatos por nombre"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Campeonato</label>
          <select
            value={form.championshipId}
            onChange={(e) => { setForm({ ...form, championshipId: e.target.value, detail: '' }); setSelectedTeam1Id(''); setSelectedTeam2Id(''); }}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Seleccionar Campeonato</option>
            {championships
              .filter((championship) => championship.name.toLowerCase().includes(championshipFilter.toLowerCase()))
              .map(championship => (
                <option key={championship.id} value={championship.id}>{championship.name}</option>
              ))}
          </select>
        </div>
        <div className="mb-6">
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
            ) : filteredChannels.map(channel => (
              <label key={channel.id} className="flex items-center gap-3 rounded border p-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.channelIds.includes(channel.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm(current => ({
                      ...current,
                      channelIds: checked
                        ? [...current.channelIds, channel.id]
                        : current.channelIds.filter(id => id !== channel.id),
                    }));
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
            ))}
          </div>
        </div>
        {form.championshipId && getChampionshipType(form.championshipId) === 'Individual' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium">Detalle</label>
            <textarea
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows={3}
              placeholder="Breve descripción del juego"
              required
            />
          </div>
        ) : form.championshipId ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium">Selecciona Equipo 1</label>
              <div className="flex flex-wrap gap-4">
                {teamsInChampionship.map(team => (
                  <div key={team.id} onClick={() => setSelectedTeam1Id(team.id)} className={`cursor-pointer border-2 p-2 rounded ${selectedTeam1Id === team.id ? 'border-blue-500' : 'border-gray-300'}`}>
                    {team.image && <img src={team.image} alt={team.name} className="w-16 h-16 mx-auto rounded" />}
                    <p className="text-center text-sm">{team.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Selecciona Equipo 2</label>
              <div className="flex flex-wrap gap-4">
                {teamsInChampionship.filter(t => t.id !== selectedTeam1Id).map(team => (
                  <div key={team.id} onClick={() => setSelectedTeam2Id(team.id)} className={`cursor-pointer border-2 p-2 rounded ${selectedTeam2Id === team.id ? 'border-blue-500' : 'border-gray-300'}`}>
                    {team.image && <img src={team.image} alt={team.name} className="w-16 h-16 mx-auto rounded" />}
                    <p className="text-center text-sm">{team.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
        <div className="mb-4">
          <label className="block text-sm font-medium">Fecha</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Hora</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Lugar</label>
          <input
            type="text"
            value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingGame ? 'Actualizar' : 'Programar'} Juego
        </button>
        {editingGame && (
          <button type="button" onClick={() => { setEditingGame(null); setForm({ championshipId: '', channelIds: [], date: '', time: '', place: '', detail: '' }); setSelectedTeam1Id(''); setSelectedTeam2Id(''); }} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
            Cancelar
          </button>
        )}
      </form>
      <ul className="space-y-4">
        {games.map(game => (
          <li key={game.id} className="border border-gray-300 rounded p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">
                {getChampionshipType(game.championshipId) === 'Individual' ? game.detail : `${getTeamName(game.team1Id)} vs ${getTeamName(game.team2Id)}`}
              </h2>
              <p>Campeonato: {getChampionshipName(game.championshipId)}</p>
              <p>Canales: {getChannelNames(game.channelIds)}</p>
              <p>Fecha: {game.date} a las {game.time}</p>
              <p>Lugar: {game.place}</p>
            </div>
            <div>
              <button onClick={() => handleEdit(game)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Editar</button>
              <button onClick={() => handleDelete(game.id)} className="bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}