const LAST_USED_KEY = 'keystone.aurasql.lastUsed';
const SETTINGS_KEY = 'keystone.aurasql.settings';

export interface AuraSqlLastUsed {
  connectionId: string;
  contextId: string;
}

export interface AuraSqlSettings {
  confirmBeforeExecution: boolean;
  openResultsAsTable: boolean;
  resultLimit: number;
}

export const DEFAULT_AURASQL_SETTINGS: AuraSqlSettings = {
  confirmBeforeExecution: true,
  openResultsAsTable: true,
  resultLimit: 100,
};

export function readLastUsed(): AuraSqlLastUsed | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LAST_USED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.connectionId === 'string' && typeof parsed?.contextId === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function persistLastUsed(value: AuraSqlLastUsed): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAST_USED_KEY, JSON.stringify(value));
}

export function readSettings(): AuraSqlSettings {
  if (typeof window === 'undefined') return DEFAULT_AURASQL_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_AURASQL_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      confirmBeforeExecution:
        typeof parsed?.confirmBeforeExecution === 'boolean'
          ? parsed.confirmBeforeExecution
          : DEFAULT_AURASQL_SETTINGS.confirmBeforeExecution,
      openResultsAsTable:
        typeof parsed?.openResultsAsTable === 'boolean'
          ? parsed.openResultsAsTable
          : DEFAULT_AURASQL_SETTINGS.openResultsAsTable,
      resultLimit:
        typeof parsed?.resultLimit === 'number' ? parsed.resultLimit : DEFAULT_AURASQL_SETTINGS.resultLimit,
    };
  } catch {
    return DEFAULT_AURASQL_SETTINGS;
  }
}

export function persistSettings(value: AuraSqlSettings): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
}
