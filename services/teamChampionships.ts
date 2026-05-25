export interface TeamChampionshipAssignment {
  id?: string;
  teamId: string;
  championshipId: string;
}

const STORAGE_KEY = 'teamChampionshipAssignments';

const readAssignments = (): TeamChampionshipAssignment[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as TeamChampionshipAssignment[];
  } catch {
    return [];
  }
};

const writeAssignments = (assignments: TeamChampionshipAssignment[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
};
const API_BASE = '/api/team-championships';

const tryFetchJson = async (input: RequestInfo, init?: RequestInit) => {
  try {
    const res = await fetch(input, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return null;
  }
};

export const getTeamChampionshipAssignments = async (): Promise<TeamChampionshipAssignment[]> => {
  const remote = await tryFetchJson(API_BASE);
  if (remote) return remote as TeamChampionshipAssignment[];
  return readAssignments();
};

export const assignTeamToChampionship = async (
  teamId: string,
  championshipId: string,
): Promise<TeamChampionshipAssignment[]> => {
  const body = { teamId, championshipId };
  const remote = await tryFetchJson(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (remote) return remote as TeamChampionshipAssignment[];

  // Fallback local
  const assignments = readAssignments();
  const alreadyAssigned = assignments.some(
    (assignment) => assignment.teamId === teamId && assignment.championshipId === championshipId,
  );
  const updated = alreadyAssigned ? assignments : [...assignments, { id: Date.now().toString(), teamId, championshipId }];
  writeAssignments(updated);
  return updated;
};

export const updateAssignment = async (
  id: string,
  data: Partial<Omit<TeamChampionshipAssignment, 'id'>>,
): Promise<TeamChampionshipAssignment | null> => {
  const remote = await tryFetchJson(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (remote) return remote as TeamChampionshipAssignment;

  // Fallback local
  const assignments = readAssignments();
  const updated = assignments.map((a) => (a.id === id ? { ...a, ...data } : a));
  writeAssignments(updated);
  return updated.find((a) => a.id === id) ?? null;
};

export const removeTeamFromChampionship = async (
  teamId: string,
  championshipId: string,
): Promise<TeamChampionshipAssignment[]> => {
  // Try delete via query params (backend should support this), otherwise fallback
  const url = `${API_BASE}?teamId=${encodeURIComponent(teamId)}&championshipId=${encodeURIComponent(championshipId)}`;
  const remote = await tryFetchJson(url, { method: 'DELETE' });
  if (remote) return remote as TeamChampionshipAssignment[];

  const assignments = readAssignments().filter(
    (assignment) => !(assignment.teamId === teamId && assignment.championshipId === championshipId),
  );
  writeAssignments(assignments);
  return assignments;
};
