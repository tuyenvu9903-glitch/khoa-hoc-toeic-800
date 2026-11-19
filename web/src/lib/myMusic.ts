// "Nhạc của bạn": music files the learner adds from their own device, kept in this browser's
// IndexedDB. They never leave the device (no upload, not part of the site or the repo).
import { useEffect, useState } from "react";

export type MyMusic = { id: string; name: string; size: number };
type Row = MyMusic & { type: string; addedAt: number; blob: Blob };

const DB = "toeic-music";
const STORE = "tracks";
export const MAX_FILE_BYTES = 40 * 1024 * 1024;
const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|webm)$/i;

export const isAudioFile = (f: { name: string; type: string }) => f.type.startsWith("audio/") || AUDIO_EXT.test(f.name);

/** "Some Song (Remix) - DJ.mp3" → "Some Song (Remix) - DJ". */
export const trackName = (fileName: string) => fileName.replace(/\.[^.]+$/, "").replace(/_/g, " ").trim() || fileName;

let dbp: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Trình duyệt này không hỗ trợ lưu nhạc."));
  dbp ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbp = null;
      reject(req.error ?? new Error("Không mở được kho nhạc của trình duyệt."));
    };
  });
  return dbp;
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const tx = d.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error ?? new Error("Lỗi kho nhạc của trình duyệt."));
        tx.onabort = () => reject(tx.error ?? new Error("Không đủ dung lượng để lưu nhạc."));
      }),
  );
}

const listeners = new Set<() => void>();
const changed = () => listeners.forEach((l) => l());

export async function listMyMusic(): Promise<MyMusic[]> {
  const rows = await run<Row[]>("readonly", (s) => s.getAll() as IDBRequest<Row[]>);
  return rows.sort((a, b) => a.addedAt - b.addedAt).map(({ id, name, size }) => ({ id, name, size }));
}

export async function myMusicBlob(id: string): Promise<Blob | null> {
  const row = await run<Row | undefined>("readonly", (s) => s.get(id) as IDBRequest<Row | undefined>);
  return row?.blob ?? null;
}

/** Add audio files; returns how many were added and the names skipped (not audio or too big). */
export async function addMyMusic(files: File[]): Promise<{ added: number; skipped: string[] }> {
  const skipped: string[] = [];
  let added = 0;
  for (const f of files) {
    if (!isAudioFile(f) || f.size > MAX_FILE_BYTES) {
      skipped.push(f.name);
      continue;
    }
    const row: Row = { id: crypto.randomUUID(), name: trackName(f.name), size: f.size, type: f.type, addedAt: Date.now() + added, blob: f };
    await run("readwrite", (s) => s.put(row));
    added++;
  }
  if (added) changed();
  return { added, skipped };
}

export async function removeMyMusic(id: string): Promise<void> {
  await run("readwrite", (s) => s.delete(id));
  changed();
}

/** The learner's files, kept up to date. Empty while loading or when storage is unavailable. */
export function useMyMusic(): MyMusic[] {
  const [list, setList] = useState<MyMusic[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () =>
      void listMyMusic()
        .then((l) => alive && setList(l))
        .catch(() => alive && setList([]));
    load();
    listeners.add(load);
    return () => {
      alive = false;
      listeners.delete(load);
    };
  }, []);
  return list;
}
