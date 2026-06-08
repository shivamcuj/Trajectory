import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Search, Filter, BookOpen, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PROFILE } from "@/lib/profile";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from "@/lib/categories";
import { EntryFormDialog } from "@/components/entry-form-dialog";
import { TimelineEntryCard } from "@/components/timeline-entry-card";
import type { EntryWithAttachments } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Profolio — Your Engineering Timeline" },
      { name: "description", content: "Track every course, project, skill, and milestone of your B.Tech journey." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [entries, setEntries] = useState<EntryWithAttachments[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryKey | "all">("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EntryWithAttachments | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("timeline_entries")
      .select("*, attachments(*)")
      .order("entry_date", { ascending: false });
    if (error) { console.error(error); setLoading(false); return; }
    setEntries((rows ?? []) as unknown as EntryWithAttachments[]);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const allSkills = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e) => e.skills.forEach((sk) => s.add(sk)));
    return Array.from(s).sort();
  }, [entries]);

  const allYears = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e) => e.academic_year && s.add(e.academic_year));
    return Array.from(s).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      if (yearFilter !== "all" && e.academic_year !== yearFilter) return false;
      if (skillFilter !== "all" && !e.skills.includes(skillFilter)) return false;
      if (q) {
        const haystack = [
          e.title, e.description ?? "", e.issuer ?? "",
          ...e.skills, ...e.tags,
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, search, categoryFilter, yearFilter, skillFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, EntryWithAttachments[]>();
    filtered.forEach((e) => {
      const key = format(parseISO(e.entry_date), "MMMM yyyy");
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORY_KEYS.forEach((k) => (counts[k] = 0));
    entries.forEach((e) => (counts[e.category] = (counts[e.category] ?? 0) + 1));
    return counts;
  }, [entries]);

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) + (yearFilter !== "all" ? 1 : 0) + (skillFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setCategoryFilter("all");
    setYearFilter("all");
    setSkillFilter("all");
    setSearch("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-3xl gradient-hero p-6 text-primary-foreground shadow-elevated sm:p-10">
        <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24 ring-4 ring-white/30 sm:h-28 sm:w-28">
              <AvatarImage src={PROFILE.photoUrl} alt={PROFILE.name} />
              <AvatarFallback className="bg-white/20 text-2xl font-display font-semibold text-white">
                {PROFILE.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                Hey, I'm {PROFILE.name}
              </h1>
              <p className="mt-1 text-sm text-primary-foreground/80 sm:text-base">
                {PROFILE.tagline}
              </p>
              <p className="mt-3 max-w-xl text-sm text-primary-foreground/75 sm:text-base">
                {PROFILE.bio}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
            {CATEGORY_KEYS.map((k) => {
              const C = CATEGORIES[k];
              const Icon = C.icon;
              return (
                <button
                  key={k}
                  onClick={() => setCategoryFilter(categoryFilter === k ? "all" : k)}
                  className={`flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-left text-sm backdrop-blur transition-all hover:bg-white/20 ${categoryFilter === k ? "ring-2 ring-white" : ""}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium opacity-80">{C.label}</div>
                    <div className="font-display text-lg font-semibold leading-none">{stats[k] ?? 0}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search titles, notes, skills, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryKey | "all")}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORY_KEYS.map((k) => (
                <SelectItem key={k} value={k}>{CATEGORIES[k].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {allYears.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}
            </SelectContent>
          </Select>

          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Skill" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All skills</SelectItem>
              {allSkills.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" /> Clear
            </Button>
          )}

          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> New entry
          </Button>
        </div>
      </div>

      {/* Active filter chips */}
      {(categoryFilter !== "all" || yearFilter !== "all" || skillFilter !== "all") && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {categoryFilter !== "all" && <Badge variant="secondary">{CATEGORIES[categoryFilter].label}</Badge>}
          {yearFilter !== "all" && <Badge variant="secondary">{yearFilter}</Badge>}
          {skillFilter !== "all" && <Badge variant="secondary">Skill: {skillFilter}</Badge>}
          <span className="ml-1 text-muted-foreground">{filtered.length} matching</span>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasEntries={entries.length > 0} onAdd={() => { setEditing(null); setDialogOpen(true); }} />
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div
            aria-hidden
            className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent"
          />
          <div className="space-y-10">
            {grouped.map(([month, monthEntries]) => (
              <div key={month}>
                <div className="relative mb-4 pl-12 sm:pl-16">
                  <div className="absolute left-3 sm:left-5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-dashed border-border bg-background" />
                  <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {month}
                  </h2>
                </div>
                <div className="space-y-4">
                  {monthEntries.map((e) => (
                    <TimelineEntryCard
                      key={e.id}
                      entry={e}
                      onEdit={() => { setEditing(e); setDialogOpen(true); }}
                      onDeleted={fetchEntries}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <EntryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editing}
        onSaved={fetchEntries}
      />
    </div>
  );
}

function EmptyState({ hasEntries, onAdd }: { hasEntries: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">
        {hasEntries ? "No entries match your filters" : "Your timeline is empty"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasEntries
          ? "Try clearing filters or searching for something else."
          : "Add your first course, project, or milestone to start building your portfolio."}
      </p>
      {!hasEntries && (
        <Button className="mt-6" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add first entry
        </Button>
      )}
    </div>
  );
}
