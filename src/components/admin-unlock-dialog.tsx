import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEditMode } from "@/lib/edit-mode-context";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function AdminUnlockDialog({ open, onOpenChange }: Props) {
  const [password, setPassword] = useState("");
  const { unlock, loading } = useEditMode();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await unlock(password);
    if (ok) {
      toast.success("Edit mode unlocked");
      setPassword("");
      onOpenChange(false);
    } else {
      toast.error("Incorrect password");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Lock className="h-4 w-4" /> Unlock edit mode
          </DialogTitle>
          <DialogDescription>
            Enter the admin password to add, edit, or delete entries.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="admin-pw">Password</Label>
            <Input
              id="admin-pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Verifying\u2026" : "Unlock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
