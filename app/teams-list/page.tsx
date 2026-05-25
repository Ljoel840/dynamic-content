'use client';

import { useState, useEffect } from 'react';
import { getTeams, Team } from '../../services/teams';
import { getChampionships, Championship } from '../../services/championships';
import { getTeamChampionshipAssignments, TeamChampionshipAssignment } from '../../services/teamChampionships';

export default function TeamsList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [assignments, setAssignments] = useState<TeamChampionshipAssignment[]>([]);
  const [filters, setFilters] = useState({ championshipId: '', teamName: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, championshipsData, assignmentsData] = await Promise.all([
          getTeams(),
          getChampionships(),
          getTeamChampionshipAssignments(),
        ]);
        setTeams(teamsData);
        setChampionships(championshipsData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback
        const storedTeams = localStorage.getItem('teams');
        if (storedTeams) {
          setTeams(JSON.parse(storedTeams));
        }
        const storedChampionships = localStorage.getItem('championships');
        if (storedChampionships) {
          setChampionships(JSON.parse(storedChampionships));
        }
        const storedAssignments = localStorage.getItem('teamChampionshipAssignments');
        if (storedAssignments) {
          setAssignments(JSON.parse(storedAssignments));
        }
      }
    };
    loadData();
  }, []);

  const getChampionshipName = (id: string) => championships.find(c => c.id === id)?.name || 'Sin campeonato';
  const getTeamChampionshipId = (teamId: string) => assignments.find(a => a.teamId === teamId)?.championshipId || '';
  const getTeamChampionshipName = (teamId: string) => getChampionshipName(getTeamChampionshipId(teamId));

  const filteredTeams = teams.filter(team => {
    const matchesLeague = filters.championshipId ? getTeamChampionshipId(team.id) === filters.championshipId : true;
    const matchesName = filters.teamName
      ? team.name.toLowerCase().includes(filters.teamName.toLowerCase())
      : true;

    return matchesLeague && matchesName;
  });

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Listado de Equipos</h1>

      <div className="grid gap-4 mb-8 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Filtrar por Campeonato</label>
          <select
            value={filters.championshipId}
            onChange={(e) => setFilters({ ...filters, championshipId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Todos los campeonatos</option>
            {championships.map(championship => (
              <option key={championship.id} value={championship.id}>{championship.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Buscar por Nombre</label>
          <input
            type="text"
            value={filters.teamName}
            onChange={(e) => setFilters({ ...filters, teamName: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Nombre del equipo"
          />
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <p>No hay equipos que coincidan con los filtros.</p>
      ) : (
        <ul className="space-y-4">
          {filteredTeams.map(team => (
            <li key={team.id} className="border border-gray-300 rounded p-4 flex items-center">
              {team.image && <img src={team.image} alt={team.name} className="w-16 h-16 mr-4 rounded" />}
              <div>
                <h2 className="text-lg font-semibold">{team.name}</h2>
                <p>Ciudad: {team.city}</p>
                <p>Fundado: {team.founded}</p>
                <p>Campeonato: {getTeamChampionshipName(team.id)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}