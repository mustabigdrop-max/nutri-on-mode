/** Playlists de rituais (ordem + duração) salvas localmente. */

const LS_KEY = "mce_audio_playlists";

export type PlaylistItem = {
  episodeId: string;
  title: string;
  subtitle: string;
  durationSeconds: number;
};

export type Playlist = {
  id: string;
  name: string;
  items: PlaylistItem[];
  createdAt: string;
};

export function loadPlaylists(): Playlist[] {
  try {
    const list = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function savePlaylists(list: Playlist[]): Playlist[] {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  return list;
}

export function createPlaylist(name: string): Playlist[] {
  const list = loadPlaylists();
  list.push({
    id: `pl_${Date.now()}`,
    name: name.trim() || `Playlist ${list.length + 1}`,
    items: [],
    createdAt: new Date().toISOString(),
  });
  return savePlaylists(list);
}

export function renamePlaylist(id: string, name: string): Playlist[] {
  return savePlaylists(loadPlaylists().map((p) => (p.id === id ? { ...p, name } : p)));
}

export function deletePlaylist(id: string): Playlist[] {
  return savePlaylists(loadPlaylists().filter((p) => p.id !== id));
}

export function addToPlaylist(id: string, item: PlaylistItem): Playlist[] {
  return savePlaylists(
    loadPlaylists().map((p) =>
      p.id === id && !p.items.some((i) => i.episodeId === item.episodeId)
        ? { ...p, items: [...p.items, item] }
        : p,
    ),
  );
}

export function removeFromPlaylist(id: string, episodeId: string): Playlist[] {
  return savePlaylists(
    loadPlaylists().map((p) => (p.id === id ? { ...p, items: p.items.filter((i) => i.episodeId !== episodeId) } : p)),
  );
}

export function moveItem(id: string, index: number, delta: number): Playlist[] {
  return savePlaylists(
    loadPlaylists().map((p) => {
      if (p.id !== id) return p;
      const items = [...p.items];
      const to = index + delta;
      if (to < 0 || to >= items.length) return p;
      [items[index], items[to]] = [items[to], items[index]];
      return { ...p, items };
    }),
  );
}

export const playlistDuration = (p: Playlist) => p.items.reduce((a, i) => a + (i.durationSeconds || 0), 0);

export const fmtMin = (seconds: number) => `${Math.round(seconds / 60)} min`;
