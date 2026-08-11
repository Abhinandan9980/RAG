'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisConfig } from '@/lib/analysis/types';
import { Switch } from '@/components/ui/switch';

interface Props {
  config: AnalysisConfig;
  onChange: (config: AnalysisConfig) => void;
}

export function AnalysisConfigAccordion({ config, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg">
      <button className="w-full flex items-center justify-between p-4 text-sm font-medium" onClick={() => setOpen(!open)}>
        Advanced Configuration
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-4 space-y-4 border-t">
          <label className="flex items-center justify-between gap-2">
            Include predictive modeling
            <Switch
              checked={config.include_predictive}
              onCheckedChange={(checked) => onChange({ ...config, include_predictive: checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            Generate slide deck
            <Switch
              checked={config.output_format.includes('pptx')}
              onCheckedChange={(checked) => {
                const fmt = checked ? ['interactive', 'pptx'] : ['interactive'];
                onChange({ ...config, output_format: fmt as AnalysisConfig['output_format'] });
              }}
            />
          </label>
          <div>
            <label className="text-sm">Max rows: {config.max_rows.toLocaleString()}</label>
            <input type="range" min={10000} max={100000} step={10000} value={config.max_rows} onChange={(e) => onChange({ ...config, max_rows: Number(e.target.value) })} className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
