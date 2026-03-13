import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'bg-blue-700 text-white'
      : 'text-blue-100 hover:bg-blue-700';

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">📦 Inventory</span>
        <Link to="/"
          className={`px-3 py-1 rounded text-sm font-medium ${isActive('/')}`}>
          Dashboard
        </Link>
        <Link to="/products"
          className={`px-3 py-1 rounded text-sm font-medium ${isActive('/products')}`}>
          Products
        </Link>
        <Link to="/categories"
          className={`px-3 py-1 rounded text-sm font-medium ${isActive('/categories')}`}>
          Categories
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">👤 {name}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">
          Logout
        </button>
      </div>
    </nav>
  );
}

