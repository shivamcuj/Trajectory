import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarDays, ExternalLink, FileText, Image as ImageIcon, Link2,
  MoreHorizontal, Pencil, Trash2, Download,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import type { EntryWithAttachments } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  entry: EntryWithAttachments;
  onEdit: () => void;
  onDeleted: () => void;
}

export function TimelineEntryCard({ entry, onEdit, onDeleted }: Props) {
  const cat = CATEGORIES[entry.category as CategoryKey];
  const Icon = cat.icon;
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this entry and all its attachments?")) return;
    setBusy(true);
    const paths = entry.attachments.filter((a) => a.storage_path).map((a) => a.storage_path!) as string[];
    if (paths.length) await supabase.storage.from("timeline-attachments").remove(paths);
    const { error } = await supabase.from("timeline_entries").delete().eq("id", entry.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Entry deleted");
    onDeleted();
  };

  const downloadFile = async (path: string, label: string) => {
    const { data, error } = await supabase.storage
      .from("timeline-attachments")
      .createSignedUrl(path, 60);
    if (error || !data) { toast.error("Couldn't open file"); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  return (
    <div className="relative pl-12 sm:pl-16">
      {/* Dot */}
      <div
        className="absolute left-3 sm:left-5 top-6 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background"
        style={{ backgroundColor: cat.colorVar }}
      >
        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.75} />
      </div>

      <article className="group rounded-2xl border bg-card p-5 shadow-card transition-all hover:shadow-elevated sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className={`${cat.bgClass} ${cat.textClass} border-transparent hover:${cat.bgClass}`} variant="outline">
                {cat.label}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {format(parseISO(entry.entry_date), "MMM d, yyyy")}
              </span>
              {entry.academic_year && (
                <span className="text-xs text-muted-foreground">· {entry.academic_year}{entry.semester ? `, ${entry.semester}` : ""}</span>
              )}
            </div>
            <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-balance sm:text-xl">
              {entry.title}
            </h3>
            {entry.issuer && (
              <p className="mt-1 text-sm text-muted-foreground">
                Issued by <span className="font-medium text-foreground">{entry.issuer}</span>
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 transition-opacity group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} disabled={busy} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {entry.description && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
            {entry.description}
          </p>
        )}

        {(entry.skills.length > 0 || entry.tags.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {entry.skills.map((s) => (
              <Badge key={`s-${s}`} variant="secondary" className="font-mono text-xs">{s}</Badge>
            ))}
            {entry.tags.map((t) => (
              <Badge key={`t-${t}`} variant="outline" className="text-xs">#{t}</Badge>
            ))}
          </div>
        )}

        {(entry.attachments.length > 0 || entry.credential_url) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
            {entry.credential_url && (
              <a
                href={entry.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Credential
              </a>
            )}
            {entry.attachments.map((a) => {
              if (a.kind === "link") {
                return (
                  <a
                    key={a.id}
                    href={a.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link2 className="h-3.5 w-3.5" /> {a.label}
                  </a>
                );
              }
              const isImage = a.mime_type?.startsWith("image/");
              return (
                <button
                  key={a.id}
                  onClick={() => a.storage_path && downloadFile(a.storage_path, a.label ?? "file")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {isImage ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                  {a.label}
                  <Download className="h-3 w-3 opacity-60" />
                </button>
              );
            })}
          </div>
        )}
      </article>
    </div>
  );
}
