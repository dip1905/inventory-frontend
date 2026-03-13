import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Admin';

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">📦 Inventory</span>
        <Link to="/" className="text-sm hover:text-blue-200">Dashboard</Link>
        <Link to="/products" className="text-sm hover:text-blue-200">Products</Link>
        <Link to="/categories" className="text-sm hover:text-blue-200">Categories</Link>
        <Link to="/suppliers" className="text-sm hover:text-blue-200">Suppliers</Link>
        <Link to="/tags" className="text-sm hover:text-blue-200">Tags</Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm">👤 {name}</span>
        <button onClick={logout}
          className="bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50">
          Logout
        </button>
      </div>
    </nav>
  );
}