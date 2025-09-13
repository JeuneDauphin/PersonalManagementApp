// Local storage utility to associate tasks with contact IDs without backend changes

type TaskContactsMap = Record<string, string[]>;

const STORAGE_KEY = 'taskContactsMap';

function readMap(): TaskContactsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: TaskContactsMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getTaskContacts(taskId: string): string[] {
  const map = readMap();
  return map[taskId] || [];
}

export function setTaskContacts(taskId: string, contactIds: string[]) {
  const map = readMap();
  map[taskId] = Array.from(new Set(contactIds));
  writeMap(map);
}

export function removeTaskContacts(taskId: string) {
  const map = readMap();
  if (map[taskId]) {
    delete map[taskId];
    writeMap(map);
  }
}
