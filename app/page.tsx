'use client';

import { useState, useEffect } from 'react';
import { getTeams, createTeam, updateTeam, deleteTeam, Team } from '../services/teams';
import { getChampionships } from '../services/championships';
import { getTeamChampionshipAssignments, TeamChampionshipAssignment } from '../services/teamChampionships';

interface Championship {
  id: string;
  name: string;
  sportId: string;
  country: string;
  season: string;
  status: 'Activo' | 'Inactivo';
}

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [assignments, setAssignments] = useState<TeamChampionshipAssignment[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form, setForm] = useState({ name: '', city: '', founded: '', image: '' });
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, championshipsData] = await Promise.all([
          getTeams(),
          getChampionships(),
        ]);
        setTeams(teamsData);
        setChampionships(championshipsData);
      } catch (error) {
        console.error('Failed to load teams or championships:', error);
        const storedTeams = localStorage.getItem('teams');
        if (storedTeams) {
          setTeams(JSON.parse(storedTeams));
        }
        const storedChampionships = localStorage.getItem('championships');
        if (storedChampionships) {
          setChampionships(JSON.parse(storedChampionships));
        }
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadAssignments = async () => {
      const assignmentsData = await getTeamChampionshipAssignments();
      setAssignments(assignmentsData);
    };
    loadAssignments();
  }, []);

  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

  const getAssignedChampionshipName = (teamId: string) => {
    const assignment = assignments.find((assignment) => assignment.teamId === teamId);
    return championships.find((championship) => championship.id === assignment?.championshipId)?.name || 'Sin campeonato';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        const updatedTeam = await updateTeam(editingTeam.id, {
          name: form.name,
          city: form.city,
          founded: parseInt(form.founded),
          image: form.image,
        });
        setTeams(teams.map((t) => (t.id === editingTeam.id ? updatedTeam : t)));
        setEditingTeam(null);
      } else {
        const newTeam = await createTeam({
          name: form.name,
          city: form.city,
          founded: parseInt(form.founded),
          image: form.image,
        });
        setTeams([...teams, newTeam]);
      }
      setForm({ name: '', city: '', founded: '', image: '' });
    } catch (error) {
      console.error('Failed to save team:', error);
      alert('Error al guardar el equipo.');
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setForm({ name: team.name, city: team.city, founded: team.founded.toString(), image: team.image });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeam(id);
      setTeams(teams.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete team:', error);
      alert('Error al eliminar el equipo.');
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Control de Equipos</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid gap-4 mb-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Ciudad</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Año de Fundación</label>
          <input
            type="number"
            value={form.founded}
            onChange={(e) => setForm({ ...form, founded: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                setForm({ ...form, image: reader.result as string });
              };
              reader.readAsDataURL(file);
            }}
            className="mt-1 block w-full text-sm text-gray-700"
          />
          <span className="block mt-2 text-sm text-gray-500">O pega una URL de imagen debajo</span>
          <input
            type="url"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="mt-2 block w-full border border-gray-300 rounded-md p-2"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingTeam ? 'Actualizar' : 'Agregar'} Equipo
        </button>
        {editingTeam && (
          <button type="button" onClick={() => { setEditingTeam(null); setForm({ name: '', city: '', founded: '', image: '' }); }} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
            Cancelar
          </button>
        )}
      </form>

      <div className="mb-6 max-w-2xl">
        <label className="block text-sm font-medium">Buscar equipo</label>
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Buscar por nombre"
        />
      </div>

      <ul className="space-y-4">
        {teams
          .filter((team) => team.name.toLowerCase().includes(filterName.toLowerCase()))
          .map((team) => (
          <li key={team.id} className="border border-gray-300 rounded p-4 flex items-center justify-between">
            <div className="flex items-center">
              {team.image && <img src={team.image} alt={team.name} className="w-16 h-16 mr-4 rounded" />}
              <div>
                <h2 className="text-lg font-semibold">{team.name}</h2>
                <p>Ciudad: {team.city}</p>
                <p>Fundado: {team.founded}</p>
                <p>Campeonato: {getAssignedChampionshipName(team.id)}</p>
              </div>
            </div>
            <div>
              <button onClick={() => handleEdit(team)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Editar</button>
              <button onClick={() => handleDelete(team.id)} className="bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
