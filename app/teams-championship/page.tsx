'use client';

import { useState, useEffect } from 'react';
import { getTeams, Team } from '../../services/teams';
import { getChampionships, Championship } from '../../services/championships';
import {
  getTeamChampionshipAssignments,
  assignTeamToChampionship,
  removeTeamFromChampionship,
  TeamChampionshipAssignment,
} from '../../services/teamChampionships';

export default function TeamsChampionshipPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [assignments, setAssignments] = useState<TeamChampionshipAssignment[]>([]);
  const [form, setForm] = useState({ championshipId: '' });
  const [filterName, setFilterName] = useState('');
  const [championshipFilter, setChampionshipFilter] = useState('');

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
        console.error('Failed to load relation data:', error);
        const storedTeams = localStorage.getItem('teams');
        if (storedTeams) setTeams(JSON.parse(storedTeams));
        const storedChampionships = localStorage.getItem('championships');
        if (storedChampionships) setChampionships(JSON.parse(storedChampionships));
        const storedAssignments = localStorage.getItem('teamChampionshipAssignments');
        if (storedAssignments) setAssignments(JSON.parse(storedAssignments));
      }
    };
    loadData();
  }, []);

  const getChampionshipName = (id: string) => championships.find((championship) => championship.id === id)?.name || 'Sin campeonato';
  const getTeamName = (id: string) => teams.find((team) => team.id === id)?.name || 'Equipo desconocido';
  const getTeamAssignments = (teamId: string) => assignments.filter((assignment) => assignment.teamId === teamId);
  const isAssignedToCurrent = (teamId: string) =>
    form.championshipId !== '' && assignments.some((assignment) => assignment.teamId === teamId && assignment.championshipId === form.championshipId);

  const handleAssign = async (teamId: string) => {
    if (!form.championshipId) {
      alert('Debes seleccionar un campeonato primero.');
      return;
    }

    try {
      const updatedAssignments = await assignTeamToChampionship(teamId, form.championshipId);
      setAssignments(updatedAssignments);
    } catch (error) {
      console.error('Failed to save assignment:', error);
      alert('Error al asignar el equipo al campeonato.');
    }
  };

  const handleRemove = async (teamId: string, championshipId: string) => {
    try {
      const updatedAssignments = await removeTeamFromChampionship(teamId, championshipId);
      setAssignments(updatedAssignments);
    } catch (error) {
      console.error('Failed to remove assignment:', error);
      alert('Error al eliminar la asignación.');
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Relacionar Equipos a Campeonato</h1>

      <div className="mb-8 max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium">Buscar campeonato</label>
          <input
            type="text"
            value={championshipFilter}
            onChange={(e) => setChampionshipFilter(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Filtrar por nombre de campeonato"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Seleccionar campeonato</label>
          <select
            value={form.championshipId}
            onChange={(e) => setForm({ ...form, championshipId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Seleccionar campeonato</option>
            {championships
              .filter((championship) =>
                championship.name.toLowerCase().includes(championshipFilter.toLowerCase()),
              )
              .map((championship) => (
                <option key={championship.id} value={championship.id}>
                  {championship.name}
                </option>
              ))}
          </select>
        </div>

        {form.championshipId ? (
          <>
            <div className="mt-6 mb-4">
              <label className="block text-sm font-medium">Buscar equipo</label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="Filtrar por nombre de equipo"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Equipos disponibles</h2>
              {teams.filter((team) => team.name.toLowerCase().includes(filterName.toLowerCase())).length === 0 ? (
                <p>No hay equipos que coincidan con el filtro.</p>
              ) : (
                <ul className="space-y-3">
                  {teams
                    .filter((team) => team.name.toLowerCase().includes(filterName.toLowerCase()))
                    .map((team) => {
                      const assignmentsForTeam = getTeamAssignments(team.id);
                      const assignedToCurrent = isAssignedToCurrent(team.id);
                      const assignedOthers = assignmentsForTeam
                        .filter((assignment) => assignment.championshipId !== form.championshipId)
                        .map((assignment) => getChampionshipName(assignment.championshipId));

                      return (
                        <li
                          key={team.id}
                          className="rounded border border-gray-300 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="font-semibold">{team.name}</p>
                            <p className="text-sm text-gray-600">Ciudad: {team.city}</p>
                            {assignedToCurrent && (
                              <p className="text-sm text-green-700">Ya asignado a este campeonato</p>
                            )}
                            {assignedOthers.length > 0 && (
                              <p className="text-sm text-yellow-700">
                                Asignado a otros campeonatos: {assignedOthers.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleAssign(team.id)}
                              disabled={assignedToCurrent}
                              className={`rounded px-3 py-2 text-white ${
                                assignedToCurrent ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                              }`}
                            >
                              {assignedToCurrent ? 'Asignado' : 'Asignar'}
                            </button>
                            {assignedToCurrent && (
                              <button
                                type="button"
                                onClick={() => handleRemove(team.id, form.championshipId)}
                                className="rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                              >
                                Desasignar
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </>
        ) : (
          <p className="mt-4 text-gray-600">Selecciona un campeonato para ver y agregar equipos.</p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Equipos asignados</h2>
        {assignments.length === 0 ? (
          <p>No hay equipos asignados a campeonatos.</p>
        ) : (
          <ul className="space-y-3">
            {assignments.map((assignment) => (
              <li
                key={`${assignment.teamId}-${assignment.championshipId}`}
                className="rounded border border-gray-300 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{getTeamName(assignment.teamId)}</p>
                  <p className="text-sm text-gray-600">Campeonato: {getChampionshipName(assignment.championshipId)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(assignment.teamId, assignment.championshipId)}
                  className="rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                >
                  Desasignar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
