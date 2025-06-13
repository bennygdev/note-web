import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddNote from './pages/AddNote';
import EditNote from './pages/EditNote';
import NoteDetail from './pages/NoteDetail';

function App() {
  return (
    <Router>
      <div className="bg-white text-gray-800 min-h-screen font-sans">
        <nav className="bg-gray-100 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link
                to="/"
                className="text-2xl font-bold text-gray-700 hover:text-gray-900 transition-colors"
              >
                NoteApp
              </Link>
              <Link
                to="/add"
                className="bg-black hover:bg-gray-800 text-white font-medium text-sm py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                + Add Note
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<AddNote />} />
            <Route path="/edit/:id" element={<EditNote />} />
            <Route path="/notes/:id" element={<NoteDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;