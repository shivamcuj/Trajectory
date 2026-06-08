import type { Database } from "@/integrations/supabase/types";

export type EntryRow = Database["public"]["Tables"]["timeline_entries"]["Row"];
export type AttachmentRow = Database["public"]["Tables"]["attachments"]["Row"];

export type EntryWithAttachments = EntryRow & { attachments: AttachmentRow[] };
