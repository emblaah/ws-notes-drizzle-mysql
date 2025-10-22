import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { addNote, getNotes, updateNote, deleteNote } from "./api/notes";
import { useState } from "react";
import { NewNoteInput, Note } from "@/types/note";

const notesListQueryOptions = () =>
  queryOptions({
    queryKey: ["notes"],
    queryFn: () => getNotes(),
  });

export const Route = createFileRoute("/notes")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(notesListQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: notes } = useSuspenseQuery(notesListQueryOptions());

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    date.setHours(date.getHours() - 2); // Adjust for timezone difference

    return new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const mutation = useMutation({
    mutationFn: (newNote: NewNoteInput) => addNote({ data: newNote }),
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]) || [];
      const optimisticNote: Note = {
        id: Math.random() * -1, // Temporary negative ID
        title: newNote.title,
        content: newNote.content || "",
        createdAt: new Date(),
      };
      queryClient.setQueryData<Note[]>(
        ["notes"],
        [...previousNotes, optimisticNote]
      );
      return { previousNotes };
    },
    onError: (_err, _newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setTitle("");
      setContent("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; title?: string; content?: string }) =>
      updateNote({ data: payload }),
    onMutate: async (updatedNote) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]) || [];
      queryClient.setQueryData<Note[]>(["notes"], (old = []) =>
        old.map((note) =>
          note.id === updatedNote.id ? { ...note, ...updatedNote } : note
        )
      );

      return { previousNotes };
    },
    onError: (_err, _updatedNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deleteNote({ data: { id } }),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]) || [];
      queryClient.setQueryData<Note[]>(["notes"], (old = []) =>
        old.filter((note) => note.id !== id)
      );
      return { previousNotes };
    },
    onError: (_err, _deletedNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const inputClassName =
    "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

  const preventSubmit = !title.trim() || mutation.isPending;

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedTitle = title.trim();
          if (!trimmedTitle) {
            return;
          }

          mutation.mutate({
            title: trimmedTitle,
            content: content.trim(),
          });
        }}
        className="rounded-2xl m-6 border border-slate-200 bg-slate-50/80 p-6 shadow-sm backdrop-blur">
        <div className="space-y-1">
          <label
            htmlFor="note-title"
            className="block text-sm font-medium text-slate-600">
            Titel
          </label>
          <input
            id="note-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titel"
            className={inputClassName}
            disabled={mutation.isPending}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="note-body"
            className="block text-sm font-medium text-slate-600">
            Innehåll
          </label>
          <textarea
            id="note-body"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Vad vill du komma ihåg?"
            className={`${inputClassName} min-h-[120px] resize-y`}
            disabled={mutation.isPending}
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={preventSubmit}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-offset-2 disabled:opacity-50 ">
            {mutation.isPending ? "Skapar…" : "Skapa anteckning"}
          </button>
        </div>
      </form>

      <ul className="grid gap-4 m-6">
        {sortedNotes.map((note) => {
          const isEditing = editingId === note.id;
          return (
            <li key={note.id} className="border rounded-2xl p-4 shadow-sm ">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {!isEditing ? (
                    <>
                      <p className="text-base font-medium ">{note.title}</p>
                      {note.content ? (
                        <p className="mt-1 max-h-20 overflow-hidden text-sm ">
                          {note.content}
                        </p>
                      ) : null}
                      <span className="text-xs text-gray-500">
                        {formatDate(note.createdAt)}
                      </span>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={inputClassName}
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={`${inputClassName} min-h-[80px]`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateMutation.mutate({
                              id: note.id,
                              title: editTitle.trim(),
                              content: editContent.trim(),
                            })
                          }
                          className="px-3 py-2 bg-green-600 text-white rounded">
                          Spara
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-2 bg-gray-300 text-black rounded">
                          Avbryt
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(note.id);
                          setEditTitle(note.title);
                          setEditContent(note.content ?? "");
                        }}
                        className="px-3 py-1 bg-yellow-400 text-black rounded">
                        Redigera
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate({ id: note.id })}
                        className="px-3 py-1 bg-red-600 text-white rounded">
                        Ta bort
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
