import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddNote() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      await fetch('http://localhost:8080/api/notes', {
        method: 'POST',
        body: formData,
      });
      if (navigate) navigate('/');
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('Failed to create note.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Add a New Note</h1>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
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
            Image (Optional)
          </label>
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
          {uploading ? 'Saving...' : 'Save Note'}
        </button>
      </form>
    </div>
  );
}

export default AddNote;