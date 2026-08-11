'use client';

import { useEffect, useState } from 'react';

import AuthPage from '@/app/auth/page';
import { AuraSqlPage } from '@/components/aurasql/AuraSqlPage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/lib/store';
import { DEFAULT_AURASQL_SETTINGS, persistSettings, readSettings } from '@/lib/aurasql/preferences';

export default function AuraSqlSettingsPage() {
  const { isAuthenticated } = useAuthStore();
  const [settings, setSettings] = useState(DEFAULT_AURASQL_SETTINGS);

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  if (!isAuthenticated) return <AuthPage />;

  const update = (next: typeof settings) => {
    setSettings(next);
    persistSettings(next);
  };

  return (
    <AuraSqlPage title="Query settings" description="Defaults for Keystone SQL generation and result exploration.">
      <form className="mx-auto w-full max-w-2xl divide-y divide-border/60 rounded-xl border border-border bg-workspace-raised px-4 shadow-sm sm:px-6">
        <label className="flex items-center justify-between gap-5 py-5">
          <span>
            <span className="block text-sm font-medium">Confirm before execution</span>
            <span className="mt-1 block text-xs text-muted-foreground">Keep generated SQL in review until you explicitly run it.</span>
          </span>
          <Switch
            checked={settings.confirmBeforeExecution}
            onCheckedChange={(checked) => update({ ...settings, confirmBeforeExecution: checked })}
          />
        </label>
        <label className="flex items-center justify-between gap-5 py-5">
          <span>
            <span className="block text-sm font-medium">Open results as table</span>
            <span className="mt-1 block text-xs text-muted-foreground">Table remains the default while graph view stays one click away.</span>
          </span>
          <Switch
            checked={settings.openResultsAsTable}
            onCheckedChange={(checked) => update({ ...settings, openResultsAsTable: checked })}
          />
        </label>
        <div className="grid gap-2 py-5 text-sm font-medium">
          Default result limit
          <Select
            value={String(settings.resultLimit)}
            onValueChange={(value) => update({ ...settings, resultLimit: Number(value) })}
          >
            <SelectTrigger aria-label="Default result limit" className="w-full font-normal sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="100">100 rows</SelectItem>
              <SelectItem value="500">500 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </AuraSqlPage>
  );
}
