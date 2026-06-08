import { createContext, useContext, useState, type ReactNode } from "react";
import { verifyPassword } from "./verify-password";

interface EditModeContextValue {
  unlocked: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  loading: boolean;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const unlock = async (password: string) => {
    setLoading(true);
    const result = await verifyPassword({ data: { password } });
    setLoading(false);
    if (result.ok) setUnlocked(true);
    return result.ok;
  };

  const lock = () => setUnlocked(false);

  return (
    <EditModeContext.Provider value={{ unlocked, unlock, lock, loading }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error("useEditMode must be used within EditModeProvider");
  return ctx;
}
