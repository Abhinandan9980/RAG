'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import AuthPage from '@/app/auth/page';
import { Loader2 } from 'lucide-react';
import { AuraSqlPage } from '@/components/aurasql/AuraSqlPage';
import { ConnectionFormFields, DEFAULT_CONNECTION_FORM_VALUES } from '@/components/aurasql/ConnectionFormFields';

export default function EditAuraSqlConnectionPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [form, setForm] = useState(DEFAULT_CONNECTION_FORM_VALUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const connection = await apiClient.getAuraSqlConnection(String(params.id));
        setForm({
          name: connection.name,
          db_type: connection.db_type,
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: '',
          database: connection.database,
          schema_name: connection.schema_name || 'public',
          ssl_required: connection.ssl_required,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load connection');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, params.id]);

  if (!isAuthenticated) return <AuthPage />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiClient.updateAuraSqlConnection(String(params.id), {
        ...form,
        port: Number(form.port),
        password: form.password || undefined,
      });
      router.push('/aurasql/connections');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update connection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuraSqlPage title="Edit database connection" description="Keep the saved access profile current without losing the schema contexts already built around it.">
      <div className="mx-auto w-full max-w-3xl py-3">
          <Card className="border-border bg-workspace-raised shadow-sm">
            <CardHeader>
              <CardTitle>Edit Connection</CardTitle>
              <CardDescription>Update connection details or password.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading connection...
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {saving ? <p aria-live="polite" className="rounded-lg border border-border bg-workspace-inset p-3 text-sm text-muted-foreground">Validating changes and updating this connection…</p> : null}
                  <fieldset className="space-y-5" disabled={saving}>
                    <ConnectionFormFields form={form} onChange={setForm} passwordRequired={false} passwordPlaceholder="Leave blank to keep" />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex justify-between gap-3">
                      <Button type="button" variant="ghost" onClick={() => router.push('/aurasql/connections')}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </fieldset>
                </form>
              )}
            </CardContent>
          </Card>
      </div>
    </AuraSqlPage>
  );
}
