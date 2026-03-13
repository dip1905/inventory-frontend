import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import {
  getProducts, createProduct, updateProduct,
  deleteProduct, getCategories, searchProducts,
  getSuppliers, getTags
} from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [form, setForm] = useState({
    name: '', description: '', price: '',
    quantity: '', lowStockThreshold: 5,
    category: { id: '' },
    supplier: { id: '' },
    tags: []
  });

  useEffect(() => {
    loadProducts();
    getCategories().then(res => setCategories(res.data));
    getSuppliers().then(res => setSuppliers(res.data));
    getTags().then(res => setTags(res.data));
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    if (e.target.value) {
      const res = await searchProducts(e.target.value);
      setProducts(res.data);
    } else {
      loadProducts();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, form);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(form);
        toast.success('Product added successfully!');
      }
      loadProducts();
      resetForm();
    } catch (err) {
      toast.error('Error saving product!');
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
      category: { id: product.category?.id || '' },
      supplier: { id: product.supplier?.id || '' },
      tags: product.tags ? product.tags.map(t => ({ id: t.id })) : []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted!');
        loadProducts();
      } catch {
        toast.error('Error deleting product!');
      }
    }
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', price: '',
      quantity: '', lowStockThreshold: 5,
      category: { id: '' },
      supplier: { id: '' },
      tags: []
    });
    setEditProduct(null);
    setShowForm(false);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Description', 'Price', 'Quantity', 'Category', 'Supplier', 'Tags'];
    const rows = products.map(p => [
      p.id, p.name, p.description,
      p.price, p.quantity,
      p.category?.name || '',
      p.supplier?.companyName || p.supplier?.name || '',
      p.tags ? p.tags.map(t => t.name).join(' | ') : ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    toast.success('CSV exported!');
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category?.id === parseInt(selectedCategory))
    : products;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <div className="flex gap-2">
            <button onClick={exportCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
              📥 Export CSV
            </button>
            <button onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              + Add Product
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearch}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="border border-gray-300 rounded-lg px-4 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex
                          items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl
                            max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input placeholder="Product Name *" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" required />

                <input placeholder="Description" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" />

                <input type="number" placeholder="Price *" value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" required />

                <input type="number" placeholder="Quantity *" value={form.quantity}
                  onChange={e => setForm({...form, quantity: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" required />

                <input type="number" placeholder="Low Stock Threshold"
                  value={form.lowStockThreshold}
                  onChange={e => setForm({...form, lowStockThreshold: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" />

                {/* Category */}
                <select
                  value={form.category.id}
                  onChange={e => setForm({...form, category: { id: e.target.value }})}
                  className="w-full border rounded-lg px-3 py-2" required>
                  <option value="">Select Category *</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {/* Supplier */}
                <select
                  value={form.supplier?.id || ''}
                  onChange={e => setForm({...form, supplier: { id: e.target.value }})}
                  className="w-full border rounded-lg px-3 py-2">
                  <option value="">Select Supplier (optional)</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName || s.name}
                    </option>
                  ))}
                </select>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="border rounded-lg px-3 py-2">
                    <p className="text-sm text-gray-500 mb-2">Tags (optional):</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <label key={tag.id}
                          className="flex items-center gap-1 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.tags.some(t => t.id === tag.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setForm({...form, tags: [...form.tags, { id: tag.id }]});
                              } else {
                                setForm({...form, tags: form.tags.filter(t => t.id !== tag.id)});
                              }
                            }}
                          />
                          {tag.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    {editProduct ? 'Update' : 'Add'}
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
            <div className="animate-spin rounded-full h-12 w-12
                            border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Products Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Supplier</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Qty</th>
                    <th className="text-left p-3">Tags</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map(p => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3">{p.category?.name || '-'}</td>
                      <td className="p-3">{p.supplier?.companyName || p.supplier?.name || '-'}</td>
                      <td className="p-3">₹{p.price?.toLocaleString()}</td>
                      <td className="p-3">{p.quantity}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {p.tags && p.tags.map(t => (
                            <span key={t.id}
                              className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                              {t.name}
                            </span>
                          ))}
                          {(!p.tags || p.tags.length === 0) && '-'}
                        </div>
                      </td>
                      <td className="p-3">
                        {p.quantity <= p.lowStockThreshold ? (
                          <span className="bg-red-100 text-red-600 px-2 py-1
                                           rounded text-xs font-medium">⚠️ Low</span>
                        ) : (
                          <span className="bg-green-100 text-green-600 px-2 py-1
                                           rounded text-xs font-medium">✅ OK</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button onClick={() => handleEdit(p)}
                          className="text-blue-600 hover:underline mr-3 text-xs">Edit</button>
                        <button onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:underline text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center p-6 text-gray-400">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-white border text-sm
                             hover:bg-gray-100 disabled:opacity-50">
                  ← Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded text-sm border
                      ${currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white hover:bg-gray-100'}`}>
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-white border text-sm
                             hover:bg-gray-100 disabled:opacity-50">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
