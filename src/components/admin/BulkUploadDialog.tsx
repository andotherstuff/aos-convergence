import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useAdminApprovals, ApprovalUpsertInput } from '@/hooks/useAdminApprovals';

interface ParsedRow {
  npub: string;
  name: string;
  email: string;
  tshirt_size: string;
  dietary_restrictions: string;
  mobility_concerns: string;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  // Detect header row
  const firstFields = parseCsvLine(lines[0]);
  const hasHeader = firstFields[0]?.toLowerCase() === 'npub';
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line) => {
    const fields = parseCsvLine(line);
    return {
      npub: fields[0] ?? '',
      name: fields[1] ?? '',
      email: fields[2] ?? '',
      tshirt_size: fields[3] ?? '',
      dietary_restrictions: fields[4] ?? '',
      mobility_concerns: fields[5] ?? '',
    };
  }).filter((r) => r.npub);
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isForbidden: boolean;
}

export function BulkUploadDialog({ open, onOpenChange, isForbidden }: Props) {
  const { addMutation } = useAdminApprovals();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<{ added: number; failed: number; errors: string[] } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCsv(reader.result as string);
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    setUploading(true);
    setResult(null);
    const total = rows.length;
    setProgress({ done: 0, total });

    let added = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process in batches of 5
    for (let i = 0; i < rows.length; i += 5) {
      const batch = rows.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map((row) =>
          addMutation.mutateAsync({
            npub: row.npub,
            name: row.name,
            email: row.email,
            tshirt_size: row.tshirt_size,
            dietary_restrictions: row.dietary_restrictions,
            mobility_concerns: row.mobility_concerns,
          } as ApprovalUpsertInput),
        ),
      );
      for (let j = 0; j < results.length; j++) {
        if (results[j].status === 'fulfilled') {
          added++;
        } else {
          failed++;
          const reason = (results[j] as PromiseRejectedResult).reason;
          errors.push(`${batch[j].npub}: ${reason instanceof Error ? reason.message : 'Unknown error'}`);
        }
      }
      setProgress({ done: Math.min(i + 5, total), total });
    }

    setResult({ added, failed, errors });
    setUploading(false);
  };

  const handleClose = (value: boolean) => {
    if (!uploading) {
      setRows([]);
      setResult(null);
      if (fileRef.current) fileRef.current.value = '';
      onOpenChange(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload Attendees</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple attendees at once. Expected columns:
            npub, name, email, tshirt_size, dietary_restrictions, mobility_concerns.
            Header row is optional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            disabled={uploading}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-border file:text-sm file:font-medium file:bg-secondary file:text-foreground hover:file:bg-secondary/80"
          />

          {rows.length > 0 && !result && (
            <>
              <div className="rounded-xl border border-border overflow-auto max-h-48">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">npub</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Name</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="px-3 py-1.5 font-mono truncate max-w-[180px]">{r.npub}</td>
                        <td className="px-3 py-1.5 truncate">{r.name}</td>
                        <td className="px-3 py-1.5 truncate">{r.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 20 && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">...and {rows.length - 20} more</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{rows.length} rows parsed</p>
                <Button
                  className="rounded-lg"
                  onClick={() => void handleUpload()}
                  disabled={isForbidden || uploading}
                >
                  {uploading ? `Uploading ${progress.done}/${progress.total}...` : 'Upload'}
                </Button>
              </div>
            </>
          )}

          {result && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Upload complete: {result.added} added, {result.failed} failed
              </p>
              {result.errors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 max-h-32 overflow-auto">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-700">{err}</p>
                  ))}
                </div>
              )}
              <Button variant="outline" className="rounded-lg" onClick={() => handleClose(false)}>
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
