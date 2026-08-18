/** Armazenamento offline dos rituais (IndexedDB) com progresso de download. */

const DB_NAME = "mce_offline_audio";
const STORE = "tracks";
const VERSION = 1;

export type OfflineEntry = {
  id: string;
  title: string;
  blob: Blob;
  bytes: number;
  savedAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export async function listOfflineIds(): Promise<string[]> {
  try {
    const keys = await tx<IDBValidKey[]>("readonly", (s) => s.getAllKeys());
    return keys.map(String);
  } catch {
    return [];
  }
}

export async function getOfflineEntry(id: string): Promise<OfflineEntry | null> {
  try {
    const entry = await tx<OfflineEntry | undefined>("readonly", (s) => s.get(id));
    return entry ?? null;
  } catch {
    return null;
  }
}

/** Retorna uma blob: URL tocável do áudio salvo, ou null. */
export async function getOfflineSrc(id: string): Promise<string | null> {
  const entry = await getOfflineEntry(id);
  return entry ? URL.createObjectURL(entry.blob) : null;
}

export async function removeOffline(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

export async function offlineTotalBytes(): Promise<number> {
  try {
    const all = await tx<OfflineEntry[]>("readonly", (s) => s.getAll());
    return all.reduce((a, e) => a + (e.bytes || 0), 0);
  } catch {
    return 0;
  }
}

/** Baixa o áudio com progresso (0–100) e guarda offline. */
export async function downloadOffline(
  id: string,
  title: string,
  url: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao baixar o áudio.");

  const total = Number(res.headers.get("content-length") || 0);
  let blob: Blob;

  if (res.body && total > 0) {
    const reader = res.body.getReader();
    const chunks: BlobPart[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value as unknown as BlobPart);
        received += value.byteLength;
        onProgress?.(Math.min(99, Math.round((received / total) * 100)));
      }
    }
    blob = new Blob(chunks, { type: res.headers.get("content-type") || "audio/mpeg" });
  } else {
    blob = await res.blob();
  }

  onProgress?.(100);
  const entry: OfflineEntry = { id, title, blob, bytes: blob.size, savedAt: new Date().toISOString() };
  await tx("readwrite", (s) => s.put(entry));
}

export const fmtBytes = (b: number) =>
  b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;
