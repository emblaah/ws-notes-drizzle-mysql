// import {
//   queryOptions,
//   useMutation,
//   useQueryClient,
//   useSuspenseQuery,
// } from "@tanstack/react-query";
// import { createFileRoute } from "@tanstack/react-router";
// import { addNote, getNotes } from "./api/notes";
// import { useState } from "react";
// import { NewNoteInput, Note } from "@/types/note";

// const notesListQueryOptions = () =>
//   queryOptions({
//     queryKey: ["notes"],
//     queryFn: () => getNotes(),
//   });

// export const Route = createFileRoute("/notes")({
//   loader: async ({ context }) => {
//     await context.queryClient.ensureQueryData(notesListQueryOptions());
//   },
//   component: RouteComponent,
// });

// function RouteComponent() {
//   const queryClient = useQueryClient();
//   const { data: notes } = useSuspenseQuery(notesListQueryOptions());

//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");

//   const mutation = useMutation<Note, Error, NewNoteInput>({
//     mutationFn: (newNote) => addNote({ data: newNote }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["notes"] });
//       setTitle("");
//       setContent("");
//     },
//   });

//   const inputClassName =
//     "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

//   const preventSubmit = !title.trim() || mutation.isPending;

//   return (
//     <div>
//       <form
//         onSubmit={(event) => {
//           event.preventDefault();
//           const trimmedTitle = title.trim();
//           if (!trimmedTitle) {
//             return;
//           }

//           mutation.mutate({
//             title: trimmedTitle,
//             content: content.trim(),
//           });
//         }}
//         className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm backdrop-blur"
//       >
//         <div className="space-y-1">
//           <label
//             htmlFor="note-title"
//             className="block text-sm font-medium text-slate-600"
//           >
//             Titel
//           </label>
//           <input
//             id="note-title"
//             value={title}
//             onChange={(event) => setTitle(event.target.value)}
//             placeholder="Titel"
//             className={inputClassName}
//             disabled={mutation.isPending}
//           />
//         </div>
//         <div className="space-y-1">
//           <label
//             htmlFor="note-body"
//             className="block text-sm font-medium text-slate-600"
//           >
//             Innehåll
//           </label>
//           <textarea
//             id="note-body"
//             value={content}
//             onChange={(event) => setContent(event.target.value)}
//             placeholder="Vad vill du komma ihåg?"
//             className={`${inputClassName} min-h-[120px] resize-y`}
//             disabled={mutation.isPending}
//           />
//         </div>
//         <div className="flex items-center justify-end gap-2 pt-2">
//           <button
//             type="submit"
//             disabled={preventSubmit}
//             className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
//           >
//             {mutation.isPending ? "Skapar…" : "Skapa anteckning"}
//           </button>
//         </div>
//       </form>
//       <ul className="grid gap-4">
//         {notes.map((note) => {
//           return (
//             <li key={note.id} className="group">
//               <div className="flex items-start justify-between gap-4">
//                 <div>
//                   <p className="text-base font-medium text-slate-900">
//                     {note.title}
//                   </p>
//                   {note.content ? (
//                     <p className="mt-1 max-h-20 overflow-hidden text-sm text-slate-500">
//                       {note.content}
//                     </p>
//                   ) : null}
//                 </div>
//               </div>
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// }

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

  const mutation = useMutation<Note, Error, NewNoteInput>({
    mutationFn: (newNote) => addNote({ data: newNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setTitle("");
      setContent("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; title?: string; content?: string }) =>
      updateNote({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (payload: { id: number }) => deleteNote({ data: payload }),
    onSuccess: () => {
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
        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm backdrop-blur">
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
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
            {mutation.isPending ? "Skapar…" : "Skapa anteckning"}
          </button>
        </div>
      </form>

      <ul className="grid gap-4 mt-6">
        {notes.map((note) => {
          const isEditing = editingId === note.id;
          return (
            <li key={note.id} className="group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {!isEditing ? (
                    <>
                      <p className="text-base font-medium text-slate-900">
                        {note.title}
                      </p>
                      {note.content ? (
                        <p className="mt-1 max-h-20 overflow-hidden text-sm text-slate-500">
                          {note.content}
                        </p>
                      ) : null}
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
