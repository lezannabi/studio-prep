import { mockStudioData } from "../data/mockStudioData";
import { cloneStructured } from "../lib/clone";
import { StudioPrepData } from "../types/domain";
import { StudioPrepRepository } from "./studioPrepRepository";

const STORAGE_KEY = "studio-prep-mvp-session";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export class BrowserStudioPrepRepository implements StudioPrepRepository {
  async load(): Promise<StudioPrepData> {
    const storage = getStorage();
    const fallback = cloneStructured(mockStudioData);

    if (!storage) {
      return fallback;
    }

    const saved = storage.getItem(STORAGE_KEY);

    if (!saved) {
      return fallback;
    }

    try {
      return JSON.parse(saved) as StudioPrepData;
    } catch {
      storage.removeItem(STORAGE_KEY);
      return fallback;
    }
  }

  async save(data: StudioPrepData): Promise<void> {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async reset(): Promise<StudioPrepData> {
    const storage = getStorage();
    storage?.removeItem(STORAGE_KEY);
    return cloneStructured(mockStudioData);
  }
}
