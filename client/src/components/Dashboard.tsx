import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Sun } from 'lucide-react';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/notes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response && response.data) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/notes',
        { ...newNote },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response && response.data) {
        const note = response.data;
        setNotes((prev) => [note, ...prev]);
        setNewNote({ title: '', content: '' });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && (response.status === 200 || response.status === 204)) {
        setNotes((prev) => prev.filter((note) => note._id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleSignOut = () => {
    logout();
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-blue-500" /> 
            <span className="text-lg font-semibold text-gray-900">Dashboard</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Status Bar Simulation */}
        <div className="flex items-center justify-between px-4 py-1 text-xs text-gray-600 bg-gray-50">
          <span>{formatTime()}</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 16h20v2H2zm1.5-1.5L4 15l.5-.5L6 13l.5.5.5-.5L8 12l.5.5.5-.5L10 11l.5.5.5-.5L12 10l.5.5.5-.5L14 9l.5.5.5-.5L16 8l.5.5.5-.5L18 7l.5.5L20 6v3l-1.5 1.5-.5-.5-.5.5L16 11l-.5-.5-.5.5L14 12l-.5-.5-.5.5L12 13l-.5-.5-.5.5L10 14l-.5-.5-.5.5L8 15l-.5-.5-.5.5L6 16l-.5-.5-.5.5L4 17l-.5-.5L2 18v-3z" />
            </svg>
            <div className="w-6 h-3 border border-gray-400 rounded-sm">
              <div className="w-4 h-full bg-gray-900 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white mx-0 mt-6 rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Welcome, {user?.email?.split('@')[0] || 'User'}!
          </h2>
          <p className="text-sm text-gray-600">Email: {user?.email || 'user@example.com'}</p>
        </div>

        {/* Create Note Button */}
        <div className="mt-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-56 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Create Note
          </button>
        </div>

        {/* Notes Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>

          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No notes yet. Create your first note!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.map((note, index) => (
                <div
                  key={note._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{note.title || `Note ${index + 1}`}</h4>
                    {note.content && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{note.content}</p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Delete note"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Note</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter note title"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter note content"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Space */}
      <div className="h-20"></div>
    </div>
  );
};

export default Dashboard;
