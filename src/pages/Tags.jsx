import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { getTags, createTag, deleteTag } from '../services/api';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadTags(); }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const res = await getTags();
      setTags(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    try {
      await createTag({ name: newTag });
      toast.success('Tag added!');
      setNewTag('');
      loadTags();
    } catch {
      toast.error('Tag already exists or error!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this tag?')) {
      try {
        await deleteTag(id);
        toast.success('Tag deleted!');
        loadTags();
      } catch {
        toast.error('Error deleting tag!');
      }
    }
  };

  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-yellow-100 text-yellow-700',
    'bg-red-100 text-red-700',
    'bg-pink-100 text-pink-700',
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tags</h1>

        {/* Add Tag Form */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              placeholder="New tag name (e.g. Electronics, On Sale)"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              + Add Tag
            </button>
          </form>
        </div>

        {/* Tags Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold text-gray-700 mb-4">
              All Tags ({tags.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag, i) => (
                <div key={tag.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${colors[i % colors.length]}`}>
                  <span>{tag.name}</span>
                  <button onClick={() => handleDelete(tag.id)}
                    className="hover:opacity-70 font-bold">×</button>
                </div>
              ))}
              {tags.length === 0 && (
                <p className="text-gray-400">No tags yet — add some!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}