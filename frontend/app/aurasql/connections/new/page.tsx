'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import AuthPage from '@/app/auth/page';
import { AuraSqlPage } from '@/components/aurasql/AuraSqlPage';
import { ConnectionFormFields, DEFAULT_CONNECTION_FORM_VALUES } from '@/components/aurasql/ConnectionFormFields';

export default function NewAuraSqlConnectionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_CONNECTION_FORM_VALUES);

  if (!isAuthenticated) return <AuthPage />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const connection = await apiClient.createAuraSqlConnection({
        ...form,
        port: Number(form.port),
      });
      router.push(`/aurasql/contexts/new?connection=${connection.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save connection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuraSqlPage title="Connect a database" description="Add the credentials AuraSQL needs, then continue directly into choosing the schema tables that ground your questions.">
      <div className="mx-auto w-full max-w-3xl py-3">
          <Card className="border-border bg-workspace-raised shadow-sm">
            <CardHeader>
              <CardTitle>New Database Connection</CardTitle>
              <CardDescription>Save a connection for Keystone SQL query generation.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                {isSubmitting ? <p aria-live="polite" className="rounded-lg border border-border bg-workspace-inset p-3 text-sm text-muted-foreground">Validating credentials and saving the connection…</p> : null}
                <fieldset className="space-y-5" disabled={isSubmitting}>
                  <ConnectionFormFields form={form} onChange={setForm} />

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <div className="flex justify-between gap-3">
                    <Button type="button" variant="ghost" onClick={() => router.push('/aurasql/connections')}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Connection'}
                    </Button>
                  </div>
                </fieldset>
              </form>
            </CardContent>
          </Card>
      </div>
    </AuraSqlPage>
  );
}
