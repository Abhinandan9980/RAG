import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ConnectionFormValues {
  name: string;
  db_type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema_name: string;
  ssl_required: boolean;
}

export const DEFAULT_CONNECTION_FORM_VALUES: ConnectionFormValues = {
  name: '',
  db_type: 'postgresql',
  host: '',
  port: 5432,
  username: '',
  password: '',
  database: '',
  schema_name: 'public',
  ssl_required: true,
};

// Shared by the full-page connection forms (new / edit) and the in-canvas
// creation drawer on the query page, so the field set only exists once.
export function ConnectionFormFields({
  form,
  onChange,
  passwordRequired = true,
  passwordPlaceholder,
}: {
  form: ConnectionFormValues;
  onChange(next: ConnectionFormValues): void;
  passwordRequired?: boolean;
  passwordPlaceholder?: string;
}) {
  const set = <K extends keyof ConnectionFormValues>(key: K, value: ConnectionFormValues[K]) =>
    onChange({ ...form, [key]: value });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Analytics DB" required />
        </div>
        <div className="space-y-2">
          <Label>Database Type</Label>
          <Select value={form.db_type} onValueChange={(value) => set('db_type', value)}>
            <SelectTrigger aria-label="Database Type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="postgresql">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="oracle">Oracle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Host</Label>
          <Input value={form.host} onChange={(e) => set('host', e.target.value)} placeholder="db.company.com" required />
        </div>
        <div className="space-y-2">
          <Label>Port</Label>
          <Input type="number" value={form.port} onChange={(e) => set('port', Number(e.target.value))} required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Username</Label>
          <Input value={form.username} onChange={(e) => set('username', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder={passwordPlaceholder}
            required={passwordRequired}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Database</Label>
          <Input value={form.database} onChange={(e) => set('database', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Schema</Label>
          <Input value={form.schema_name} onChange={(e) => set('schema_name', e.target.value)} placeholder="public" />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-workspace-inset px-4 py-3">
        <div>
          <p className="text-sm font-medium">Require SSL</p>
          <p className="text-xs text-muted-foreground">Enable SSL connections by default.</p>
        </div>
        <input
          type="checkbox"
          checked={form.ssl_required}
          onChange={(event) => set('ssl_required', event.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/40"
        />
      </div>
    </>
  );
}
