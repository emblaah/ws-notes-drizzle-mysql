// export type Note = {
//   id: number;
//   title: string;
//   content?: string;
//   createdAt: Date | null;
// };

// export type NewNoteInput = { title: string; content: string };

import { notesTable } from "@/db/schema";

export type Note = typeof notesTable.$inferSelect;
export type NewNoteInput = typeof notesTable.$inferInsert;
