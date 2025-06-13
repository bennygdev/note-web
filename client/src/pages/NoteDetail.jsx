import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/notes/${id}`);
        if (!response.ok) {
          throw new Error('Note not found');
        }
        const data = await response.json();
        setNote(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  if (loading) return <div className="text-center mt-8">Loading note...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  if (!note) return <div className="text-center mt-8">Note not found.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {note.image_url && (
        <img
          src={note.image_display_url}
          alt={note.title}
          className="w-full h-96 object-cover"
        />
      )}
      <div className="p-8 md:p-12">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">{note.title}</h1>
        <p className="text-gray-500 mb-8">
          Created: {new Date(note.created_at).toLocaleDateString()}
        </p>
        <div className="prose prose-lg max-w-none text-gray-700">
          <p>{note.content}</p>
        </div>
        <div className="mt-12 pt-6 border-t border-gray-200 flex items-center gap-4">
          <Link
            to={`/edit/${note.note_id}`}
            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Edit Note
          </Link>
          <Link to="/" className="text-gray-600 hover:underline">
            ← Back to all notes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NoteDetail;