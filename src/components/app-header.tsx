import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero shadow-card transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold tracking-tight">Profolio</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Engineering Portfolio
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
