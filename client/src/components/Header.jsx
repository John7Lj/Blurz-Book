import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Book, User, LogOut, Home, PlusCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" onError={(e) => e.target.style.display = 'none'} />
            <span className="text-2xl font-bold">Blurz Books</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200 transition flex items-center gap-2">
              <Home size={18} /> Home
            </Link>
            <Link to="/books" className="hover:text-blue-200 transition flex items-center gap-2">
              <Book size={18} /> Books
            </Link>
            <Link to="/my-books" className="hover:text-blue-200 transition flex items-center gap-2">
              <User size={18} /> My Books
            </Link>
            <Link to="/add-book" className="hover:text-blue-200 transition flex items-center gap-2">
              <PlusCircle size={18} /> Add Book
            </Link>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition flex items-center gap-2">
              <LogOut size={18} /> Logout
            </button>
          </nav>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2">
            <Link to="/" className="block py-2 hover:bg-blue-700 px-2 rounded" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/books" className="block py-2 hover:bg-blue-700 px-2 rounded" onClick={() => setMobileMenuOpen(false)}>Books</Link>
            <Link to="/my-books" className="block py-2 hover:bg-blue-700 px-2 rounded" onClick={() => setMobileMenuOpen(false)}>My Books</Link>
            <Link to="/add-book" className="block py-2 hover:bg-blue-700 px-2 rounded" onClick={() => setMobileMenuOpen(false)}>Add Book</Link>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left py-2 hover:bg-red-700 px-2 rounded">Logout</button>
          </nav>
        )}
      </div>
    </header>
  );
};
export default Header;
