import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  getCategories, createCategory,
  updateCategory, deleteCategory
} from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = () => {
    getCategories().then(res => setCategories(res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCat) {
        await updateCategory(editCat.id, form);
      } else {
        await createCategory(form);
      }
      loadCategories();
      resetForm();
    } catch (err) {
      alert('Error saving category');
    }
  };

  const handleEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setEditCat(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Add Category
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex
                          items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4">
                {editCat ? 'Edit Category' : 'Add Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  placeholder="Category Name"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <input
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    {editCat ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow p-4">
              <h3 className="font-bold text-gray-800 text-lg">{c.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{c.description}</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(c)}
                  className="text-blue-600 text-sm hover:underline">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-600 text-sm hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-400 col-span-3 text-center py-8">
              No categories yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}