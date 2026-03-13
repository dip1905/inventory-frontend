import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', companyName: '', email: '',
    phone: '', address: '', description: ''
  });

  useEffect(() => { loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await getSuppliers();
      setSuppliers(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editSupplier) {
        await updateSupplier(editSupplier.id, form);
        toast.success('Supplier updated!');
      } else {
        await createSupplier(form);
        toast.success('Supplier added!');
      }
      loadSuppliers();
      resetForm();
    } catch {
      toast.error('Error saving supplier!');
    }
  };

  const handleEdit = (supplier) => {
    setEditSupplier(supplier);
    setForm({
      name: supplier.name,
      companyName: supplier.companyName || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      description: supplier.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this supplier?')) {
      try {
        await deleteSupplier(id);
        toast.success('Supplier deleted!');
        loadSuppliers();
      } catch {
        toast.error('Error deleting supplier!');
      }
    }
  };

  const resetForm = () => {
    setForm({ name: '', companyName: '', email: '', phone: '', address: '', description: '' });
    setEditSupplier(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
          <button onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Add Supplier
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4">
                {editSupplier ? 'Edit Supplier' : 'Add Supplier'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input placeholder="Contact Name *" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" required />
                <input placeholder="Company Name" value={form.companyName}
                  onChange={e => setForm({...form, companyName: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" />
                <input placeholder="Email" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" />
                <input placeholder="Phone" value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" />
                <input placeholder="Address" value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" />
                <textarea placeholder="Description" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" rows={2} />
                <div className="flex gap-2 pt-2">
                  <button type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    {editSupplier ? 'Update' : 'Add'}
                  </button>
                  <button type="button" onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{s.companyName || s.name}</h3>
                    <p className="text-sm text-gray-500">{s.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(s)}
                      className="text-blue-600 text-xs hover:underline">Edit</button>
                    <button onClick={() => handleDelete(s.id)}
                      className="text-red-600 text-xs hover:underline">Delete</button>
                  </div>
                </div>
                {s.email && <p className="text-sm text-gray-600">📧 {s.email}</p>}
                {s.phone && <p className="text-sm text-gray-600">📞 {s.phone}</p>}
                {s.address && <p className="text-sm text-gray-600">📍 {s.address}</p>}
                {s.description && (
                  <p className="text-sm text-gray-500 mt-2 border-t pt-2">{s.description}</p>
                )}
              </div>
            ))}
            {suppliers.length === 0 && (
              <div className="col-span-3 text-center py-20 text-gray-400">
                No suppliers yet — add one!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}