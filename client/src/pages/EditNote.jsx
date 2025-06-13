import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditNote() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [existingImageDisplayUrl, setExistingImageDisplayUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/notes/${id}`);
        const data = await response.json();
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
        setExistingImageUrl(data.image_url);
        setExistingImageDisplayUrl(data.image_display_url);
      } catch (error) {
        console.error('Failed to fetch note:', error);
      }
    };
    fetchNote();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let imageUrl = existingImageUrl;
    if (image) {
      try {
        const res = await fetch('http://localhost:8080/api/notes/upload-url');
        const { uploadUrl, key } = await res.json();

        await fetch(uploadUrl, {
          method: 'PUT',
          body: image,
          headers: { 'Content-Type': image.type },
        });
        imageUrl = key;
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert('Failed to upload image.');
        setUploading(false);
        return;
      }
    }

    try {
      await fetch(`http://localhost:8080/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, image_url: imageUrl }),
      });
      if (navigate) navigate('/');
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('Failed to update note.');
    } finally {
      setUploading(false);
    }
  };

  if (!note) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Edit Note</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            required
            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          ></textarea>
        </div>
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Change Image (Optional)
          </label>
          {existingImageUrl && !image && (
            <div className="mb-4">
              <img
                src={existingImageDisplayUrl}
                alt="Current"
                className="w-48 h-auto rounded-md"
              />
              <p className="text-gray-500 text-sm mt-2">Current image.</p>
            </div>
          )}
          <input
            type="file"
            id="image"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
            className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default EditNote;