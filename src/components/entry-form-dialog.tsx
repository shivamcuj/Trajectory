import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Upload, X, Link2, FileText, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from "@/lib/categories";
import type { EntryWithAttachments } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entry?: EntryWithAttachments | null;
  onSaved: () => void;
}

interface PendingFile {
  file: File;
  label: string;
}

interface PendingLink {
  label: string;
  url: string;
}

export function EntryFormDialog({ open, onOpenChange, entry, onSaved }: Props) {
  const isEdit = Boolean(entry);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryKey>("project");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("Year 1");
  const [issuer, setIssuer] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [pendingLinks, setPendingLinks] = useState<PendingLink[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<EntryWithAttachments["attachments"]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (entry) {
      setTitle(entry.title);
      setDescription(entry.description ?? "");
      setCategory(entry.category as CategoryKey);
      setEntryDate(entry.entry_date);
      setSemester(entry.semester ?? "");
      setAcademicYear(entry.academic_year ?? "Year 1");
      setIssuer(entry.issuer ?? "");
      setCredentialUrl(entry.credential_url ?? "");
      setSkills(entry.skills ?? []);
      setTags(entry.tags ?? []);
      setExistingAttachments(entry.attachments ?? []);
    } else {
      setTitle("");
      setDescription("");
      setCategory("project");
      setEntryDate(new Date().toISOString().slice(0, 10));
      setSemester("");
      setAcademicYear("Year 1");
      setIssuer("");
      setCredentialUrl("");
      setSkills([]);
      setTags([]);
      setExistingAttachments([]);
    }
    setSkillsInput("");
    setTagsInput("");
    setPendingFiles([]);
    setPendingLinks([]);
    setLinkLabel("");
    setLinkUrl("");
    setRemovedAttachmentIds([]);
  }, [open, entry]);

  const addToken = (raw: string, list: string[], setList: (v: string[]) => void) => {
    const v = raw.trim().replace(/,$/, "");
    if (!v) return;
    if (list.includes(v)) return;
    setList([...list, v]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPendingFiles((prev) => [...prev, ...files.map((f) => ({ file: f, label: f.name }))]);
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      let entryId = entry?.id;

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        entry_date: entryDate,
        semester: semester || null,
        academic_year: academicYear || null,
        issuer: issuer.trim() || null,
        credential_url: credentialUrl.trim() || null,
        skills,
        tags,
      };

      if (isEdit && entryId) {
        const { error } = await supabase.from("timeline_entries").update(payload).eq("id", entryId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("timeline_entries")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        entryId = data.id;
      }

      // Remove deleted attachments
      if (removedAttachmentIds.length) {
        const removed = existingAttachments.filter((a) => removedAttachmentIds.includes(a.id));
        const paths = removed.filter((a) => a.storage_path).map((a) => a.storage_path!) as string[];
        if (paths.length) {
          await supabase.storage.from("timeline-attachments").remove(paths);
        }
        await supabase.from("attachments").delete().in("id", removedAttachmentIds);
      }

      // Upload files
      for (const pf of pendingFiles) {
        const ext = pf.file.name.split(".").pop() ?? "bin";
        const path = `${entryId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("timeline-attachments")
          .upload(path, pf.file, { contentType: pf.file.type });
        if (upErr) throw upErr;
        const { error: aErr } = await supabase.from("attachments").insert({
          entry_id: entryId!,
          kind: "file",
          label: pf.label || pf.file.name,
          storage_path: path,
          mime_type: pf.file.type,
          size_bytes: pf.file.size,
        });
        if (aErr) throw aErr;
      }

      // Insert links
      for (const pl of pendingLinks) {
        const { error: lErr } = await supabase.from("attachments").insert({
          entry_id: entryId!,
          kind: "link",
          label: pl.label || pl.url,
          url: pl.url,
        });
        if (lErr) throw lErr;
      }

      toast.success(isEdit ? "Entry updated" : "Entry added");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEdit ? "Edit entry" : "New timeline entry"}
          </DialogTitle>
          <DialogDescription>
            Document a course, project, skill or milestone. Attach files, images, and links.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as CategoryKey)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_KEYS.map((k) => {
                    const C = CATEGORIES[k];
                    const Icon = C.icon;
                    return (
                      <SelectItem key={k} value={k}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: C.colorVar }} />
                          {C.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" required value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Academic year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger id="year"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Year 1", "Year 2", "Year 3", "Year 4"].map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sem">Semester</Label>
              <Select value={semester || "none"} onValueChange={(v) => setSemester(v === "none" ? "" : v)}>
                <SelectTrigger id="sem"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="desc">Description / notes</Label>
              <Textarea
                id="desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed notes, key learnings, code snippets, reflections…"
                maxLength={5000}
              />
            </div>

            {(category === "course_certification" || category === "milestone") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="issuer">Issuer / Organization</Label>
                  <Input id="issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Coursera, NPTEL, IEEE…" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cred">Credential URL / ID</Label>
                  <Input id="cred" value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} placeholder="https://…" />
                </div>
              </>
            )}

            <TokenField
              className="sm:col-span-2"
              label="Skills / Tech stack"
              placeholder="Press Enter to add (e.g. Python, MATLAB, AutoCAD)"
              tokens={skills}
              setTokens={setSkills}
              input={skillsInput}
              setInput={setSkillsInput}
              onCommit={() => addToken(skillsInput, skills, setSkills)}
            />

            <TokenField
              className="sm:col-span-2"
              label="Custom tags"
              placeholder="Press Enter to add"
              tokens={tags}
              setTokens={setTags}
              input={tagsInput}
              setInput={setTagsInput}
              onCommit={() => addToken(tagsInput, tags, setTags)}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Attachments</Label>
            </div>

            {existingAttachments.length > 0 && (
              <div className="space-y-1.5">
                {existingAttachments.map((a) => {
                  const removed = removedAttachmentIds.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm ${removed ? "opacity-40 line-through" : ""}`}
                    >
                      {a.kind === "link" ? <Link2 className="h-4 w-4 text-accent" /> : <FileText className="h-4 w-4 text-accent" />}
                      <span className="flex-1 truncate">{a.label}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setRemovedAttachmentIds((prev) =>
                            removed ? prev.filter((id) => id !== a.id) : [...prev, a.id]
                          )
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {pendingFiles.length > 0 && (
              <div className="space-y-1.5">
                {pendingFiles.map((pf, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                    {pf.file.type.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-accent" />
                    ) : (
                      <FileText className="h-4 w-4 text-accent" />
                    )}
                    <span className="flex-1 truncate">{pf.file.name}</span>
                    <span className="text-xs text-muted-foreground">{(pf.file.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {pendingLinks.length > 0 && (
              <div className="space-y-1.5">
                {pendingLinks.map((pl, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                    <Link2 className="h-4 w-4 text-accent" />
                    <span className="flex-1 truncate">{pl.label}</span>
                    <button
                      type="button"
                      onClick={() => setPendingLinks((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed bg-background px-3 py-2 text-sm hover:bg-secondary">
                <Upload className="h-4 w-4" />
                <span>Add files (PDF, image…)</span>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept="image/*,application/pdf,.doc,.docx,.txt,.md" />
              </label>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
              <Input placeholder="Link label (e.g. GitHub repo)" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} />
              <Input placeholder="https://…" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!linkUrl.trim()) return;
                  try { new URL(linkUrl); } catch { toast.error("Enter a valid URL"); return; }
                  setPendingLinks((prev) => [...prev, { label: linkLabel.trim() || linkUrl, url: linkUrl.trim() }]);
                  setLinkLabel("");
                  setLinkUrl("");
                }}
              >
                <Link2 className="h-4 w-4" /> Add link
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add to timeline"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TokenField({
  label, placeholder, tokens, setTokens, input, setInput, onCommit, className,
}: {
  label: string; placeholder: string;
  tokens: string[]; setTokens: (v: string[]) => void;
  input: string; setInput: (v: string) => void;
  onCommit: () => void; className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5 rounded-md border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
        {tokens.map((t) => (
          <Badge key={t} variant="secondary" className="gap-1">
            {t}
            <button type="button" onClick={() => setTokens(tokens.filter((x) => x !== t))} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          className="flex-1 min-w-[140px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              onCommit();
              setInput("");
            } else if (e.key === "Backspace" && !input && tokens.length) {
              setTokens(tokens.slice(0, -1));
            }
          }}
          onBlur={() => { onCommit(); setInput(""); }}
        />
      </div>
    </div>
  );
}
