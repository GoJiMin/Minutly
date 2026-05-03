class LocalStorage {
  private readonly namespace: string;

  constructor(namespace = 'minutly') {
    this.namespace = namespace;
  }

  read(key: string): unknown | null {
    const storage = this.getStorage();

    if (!storage) return null;

    const value = storage.getItem(this.createKey(key));

    if (!value) return null;

    try {
      const parsed: unknown = JSON.parse(value);

      return parsed;
    } catch {
      return null;
    }
  }

  write<T>(key: string, value: T): void {
    const storage = this.getStorage();

    if (!storage) return;

    storage.setItem(this.createKey(key), JSON.stringify(value));
  }

  remove(key: string): void {
    const storage = this.getStorage();

    if (!storage) return;

    storage.removeItem(this.createKey(key));
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;

    return window.localStorage;
  }

  private createKey(key: string) {
    return `${this.namespace}:${key}`;
  }
}

export const localStorageClient = new LocalStorage();
