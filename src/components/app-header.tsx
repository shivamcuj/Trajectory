import { Link } from "@tanstack/react-router";
import { Sparkles, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditMode } from "@/lib/edit-mode-context";
import { AdminUnlockDialog } from "@/components/admin-unlock-dialog";

export function AppHeader() {
  const { unlocked, lock } = useEditMode();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero shadow-card transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold tracking-tight">Trajectory</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Engineering Portfolio
            </div>
          </div>
        </Link>

        {unlocked ? (
          <Button variant="ghost" size="sm" onClick={lock}>
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            Lock
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)}>
            <Unlock className="mr-1.5 h-3.5 w-3.5" />
            Unlock to edit
          </Button>
        )}

        <AdminUnlockDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </header>
  );
}
