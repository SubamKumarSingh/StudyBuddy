import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { fetchNotes, addNote, removeNote } from "../api/notes";

export default function NotesPanel() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const res = await fetchNotes();
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const tempNote = {
      id: Date.now(),
      title: "Quick Note",
      content: newNote,
    };

    setNotes([tempNote, ...notes]);
    setNewNote("");

    try {
      const res = await addNote({
        title: "Quick Note",
        content: tempNote.content,
      });

      setNotes((prev) => prev.map((n) => (n.id === tempNote.id ? res.data : n)));
    } catch (err) {
      console.error(err);
      loadNotes();
    }
  };

  const handleDelete = async (id) => {
    const prev = notes;
    setNotes(notes.filter((n) => n.id !== id));

    try {
      await removeNote(id);
    } catch (err) {
      console.error(err);
      setNotes(prev);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-orange-600">Notes</p>
       
      </div>

      <div className="space-y-3 rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a quick note..."
          className="h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
        <button
          onClick={handleAddNote}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.22)] transition hover:bg-orange-500"
        >
          <Plus size={14} />
          Add note
        </button>
      </div>

      <div className="space-y-3">
        {loading && (
          <p className="py-3 text-center text-sm text-slate-400">Loading notes...</p>
        )}

        {!loading && notes.length === 0 && (
          <p className="py-3 text-center text-sm text-slate-400">No notes yet</p>
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-950">{note.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{note.content}</p>
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-red-500"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
