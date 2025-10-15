import { addNoteDB, getNotesDB, updateNoteDB, deleteNoteDB } from "@/db/db";
import { createServerFn } from "@tanstack/react-start";

export const getNotes = createServerFn({
  method: "GET",
}).handler(async () => {
  return await getNotesDB();
});

export const addNote = createServerFn({
  method: "POST",
})
  .inputValidator((note: { title: string; content?: string }) => {
    if (typeof note !== "object" || note === null) {
      throw new Error("Note payload måste vara ett objekt");
    }

    const title = note.title?.trim();

    if (!title) {
      throw new Error("Titel är obligatorisk");
    }

    return {
      title,
      content:
        typeof note.content === "string"
          ? note.content.trim()
          : (note.content ?? ""),
    };
  })
  .handler(async ({ data }) => {
    return addNoteDB(data);
  });

export const updateNote = createServerFn({
  method: "POST",
})
  .inputValidator((input: { id: number; title?: string; content?: string }) => {
    if (!input || typeof input !== "object" || typeof input.id !== "number") {
      throw new Error("Ogiltigt payload för uppdatering");
    }
    return {
      id: input.id,
      title: typeof input.title === "string" ? input.title.trim() : undefined,
      content:
        typeof input.content === "string" ? input.content.trim() : undefined,
    };
  })
  .handler(async ({ data }) => {
    const updated = await updateNoteDB(data.id, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
    });
    return updated;
  });

export const deleteNote = createServerFn({
  method: "POST",
})
  .inputValidator((input: { id: number }) => {
    if (!input || typeof input !== "object" || typeof input.id !== "number") {
      throw new Error("Ogiltigt payload för borttagning");
    }
    return input;
  })
  .handler(async ({ data }) => {
    await deleteNoteDB(data.id);
    return { ok: true };
  });
