'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConnectionFormFields, DEFAULT_CONNECTION_FORM_VALUES } from '@/components/aurasql/ConnectionFormFields';
import { apiClient } from '@/lib/api';
import type { AuraSqlConnection } from '@/lib/types';

interface CreateConnectionDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  onCreated(connection: AuraSqlConnection): void;
}

// The in-canvas equivalent of app/aurasql/connections/new/page.tsx — same
// fields (via the shared ConnectionFormFields), so first-time setup never
// has to leave the query workspace.
export function CreateConnectionDialog({ open, onOpenChange, onCreated }: CreateConnectionDialogProps) {
  const [form, setForm] = useState(DEFAULT_CONNECTION_FORM_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const connection = await apiClient.createAuraSqlConnection({
        ...form,
        port: Number(form.port),
      });
      setForm(DEFAULT_CONNECTION_FORM_VALUES);
      onCreated(connection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save connection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !submitting) onOpenChange(false); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect a database</DialogTitle>
          <DialogDescription>Add the credentials Keystone SQL needs, then pick the schema tables to ground your questions.</DialogDescription>
        </DialogHeader>
        <form className="mt-2 space-y-5" onSubmit={handleSubmit}>
          <fieldset className="space-y-5" disabled={submitting}>
            <ConnectionFormFields form={form} onChange={setForm} />
          </fieldset>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button disabled={submitting} onClick={() => onOpenChange(false)} type="button" variant="ghost">Cancel</Button>
            <Button disabled={submitting} type="submit">{submitting ? 'Saving…' : 'Save connection'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
