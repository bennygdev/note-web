import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/notes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await fetch(`http://localhost:8080/api/notes/${id}`, {
          method: 'DELETE',
        });
        setNotes(notes.filter((note) => note.note_id !== id));
      } catch (error) {
        console.error('Failed to delete note:', error);
        alert('Failed to delete note.');
      }
    }
  };

  if (loading) return <div className="text-center mt-8">Loading notes...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-gray-800">My Notes</h1>
      {notes.length === 0 ? (
        <p className="text-gray-600">
          You haven't created any notes yet.{' '}
          <Link to="/add" className="text-gray-600 hover:underline">
            Create one now!
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.note_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-105 duration-300"
            >
              {note.image_url && (
                <img
                  src={note.image_display_url}
                  alt={note.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                  {note.title}
                </h2>
                <p className="text-gray-600 mb-4 truncate">{note.content}</p>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/notes/${note.note_id}`}
                    className="bg-black text-white py-1 px-3 rounded-md text-sm hover:bg-gray-800"
                  >
                    Read More
                  </Link>
                  <div>
                    <Link
                      to={`/edit/${note.note_id}`}
                      className="text-gray-600 hover:underline mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(note.note_id)}
                      className="text-gray-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;