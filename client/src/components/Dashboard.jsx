// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Book, 
  User, 
  Home, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search 
} from 'lucide-react';


import ProfilePage from './ProfilePage';
import Logo from './Logo';


import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BookCard from './BookCard';
import BookDetailView from './BookDetailView';
import AddBookForm from './AddBookForm';
import LoadingSpinner from './LoadingSpinner';
import useToast from '../hooks/useToast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [books, setBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  });

  const { showToast, ToastContainer } = useToast();

  const bgClass = settings.darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = settings.darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900';
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200';

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', settings.darkMode);
  }, [settings.darkMode]);

  useEffect(() => {
    loadBooks();
    if (user?.user_id) {
      loadMyBooks();
    }
  }, [user]);

 const loadBooks = async () => {
  try {
    const response = await api.get('/book/');
    setBooks(response.data);
  } catch (error) {
    // Handle nested error structure
    const errorMsg = error.response?.data?.detail?.message || 
                     error.response?.data?.detail || 
                     error.message;
    showToast(errorMsg, 'error');
  } finally {
    setLoading(false);
  }
};
const loadMyBooks = async () => {
  try {
    const response = await api.get(`/book/user/${user.user_id}`);
    setMyBooks(response.data);
  } catch (error) {
    const errorMsg = error.response?.data?.detail?.message || 
                     error.response?.data?.detail || 
                     error.message;
    showToast(errorMsg, 'error');
  }
};


const handleAddBook = async (formData) => {
  try {
    const publishedDate = formData.published_date
      ? `${formData.published_date}T00:00:00`
      : new Date().toISOString();

    const bookData = {
      ...formData,
      published_date: publishedDate,
      page_count: parseInt(formData.page_count),
    };

    await api.post('/book/create_book', bookData);
    showToast('Book added successfully!', 'success');
    setShowAddBook(false);
    setCurrentView('my-books');
    loadBooks();
    loadMyBooks();
  } catch (error) {
    const errorMsg = error.response?.data?.detail?.message || 
                     error.response?.data?.detail || 
                     error.userMessage || 
                     error.message;
    showToast(errorMsg, 'error');
  }
};

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      showToast('Logged out successfully', 'success');
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'books', label: 'All Books', icon: Book },
    { id: 'my-books', label: 'My Books', icon: User },
    { id: 'add-book', label: 'Add Book', icon: PlusCircle },
      { id: 'profile', label: 'Profile', icon: User }, // Add this line

  ];

  const filteredBooks = currentView === 'books' 
    ? books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : myBooks.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="text-center">
          <LoadingSpinner darkMode={settings.darkMode} />
          <p className={`mt-4 ${textClass} text-sm`}>Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} transition-colors`} style={{ fontFamily: settings.fontFamily }}>
      <ToastContainer />
      
      {/* Mobile Header */}
      <div className={`${cardClass} border-b ${borderClass} sticky top-0 z-40 shadow-sm`}>
  <div className="flex items-center justify-between p-4">
    <Logo size="medium" darkMode={settings.darkMode} />
    
    <div className="flex items-center gap-2">
      <button
        onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
        className={`p-2 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:opacity-80 transition-opacity`}
      >
        {settings.darkMode ? 
          <Sun className="w-5 h-5 text-yellow-400" /> : 
          <Moon className="w-5 h-5 text-gray-600" />
        }
      </button>
      
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`p-2 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:opacity-80 transition-opacity lg:hidden`}
      >
        <Menu className={`w-5 h-5 ${textClass}`} />
      </button>
    </div>
  </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2 px-4 pb-4 flex-wrap">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setCurrentView(id);
                setSelectedBookId(null);
                setShowAddBook(false);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                currentView === id 
                  ? 'bg-blue-500 text-white' 
                  : `${settings.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className={`ml-auto px-4 py-2 rounded-lg flex items-center gap-2 ${settings.darkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-500 text-white hover:bg-red-600'} transition-colors`}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 ${cardClass} border-r ${borderClass} z-50 transform transition-transform duration-300 ease-in-out shadow-xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:hidden
      `}>
        <div className={`p-4 border-b ${borderClass} flex items-center justify-between`}>
          <h2 className={`text-lg font-semibold ${textClass}`}>Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <X className={`w-5 h-5 ${textClass}`} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setCurrentView(id);
                setSelectedBookId(null);
                setShowAddBook(false);
                setSearchQuery('');
                setSidebarOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                currentView === id 
                  ? 'bg-blue-500 text-white' 
                  : `${settings.darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
          <button
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
            className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 ${settings.darkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-500 text-white hover:bg-red-600'} transition-colors`}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Book Detail View */}
        {selectedBookId && (
          <BookDetailView
            bookId={selectedBookId}
            onBack={() => setSelectedBookId(null)}
            settings={settings}
            showToast={showToast}
          />
        )}

        {/* Home View */}
        {!selectedBookId && currentView === 'home' && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <h1 className={`text-5xl font-bold ${textClass} mb-4`}>
                Welcome, {user?.username}!
              </h1>
              <p className={`text-xl ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your book collection with ease
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => setCurrentView('books')}
                className={`${cardClass} rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2`}
              >
                <Book className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className={`text-2xl font-bold ${textClass} mb-2`}>All Books</h3>
                <p className={settings.darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Explore our collection
                </p>
                <div className={`mt-4 text-3xl font-bold text-blue-500`}>{books.length}</div>
              </button>

              <button
                onClick={() => setCurrentView('my-books')}
                className={`${cardClass} rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2`}
              >
                <User className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h3 className={`text-2xl font-bold ${textClass} mb-2`}>My Books</h3>
                <p className={settings.darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Your personal collection
                </p>
                <div className={`mt-4 text-3xl font-bold text-purple-500`}>{myBooks.length}</div>
              </button>

              <button
                onClick={() => setCurrentView('add-book')}
                className={`${cardClass} rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2`}
              >
                <PlusCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className={`text-2xl font-bold ${textClass} mb-2`}>Add Book</h3>
                <p className={settings.darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Add to your collection
                </p>
              </button>
            </div>
          </div>
        )}

        {/* All Books View */}
        {!selectedBookId && currentView === 'books' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className={`text-4xl font-bold ${textClass}`}>All Books</h1>
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${borderClass} focus:ring-2 focus:ring-blue-500 outline-none`}
                />
              </div>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className={settings.darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {searchQuery ? 'No books found matching your search.' : 'No books available.'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => setSelectedBookId(book.id)}
                    settings={settings}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Books View */}
        {!selectedBookId && currentView === 'my-books' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className={`text-4xl font-bold ${textClass}`}>My Books</h1>
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search your books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${borderClass} focus:ring-2 focus:ring-blue-500 outline-none`}
                />
              </div>
            </div>

            {myBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  You haven't added any books yet.
                </p>
                <button
                  onClick={() => setCurrentView('add-book')}
                  className="text-blue-500 hover:text-blue-600 font-semibold"
                >
                  Add your first book →
                </button>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className={settings.darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No books found matching your search.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => setSelectedBookId(book.id)}
                    settings={settings}
                  />
                ))}
              </div>
            )}
          </div>
        )}
{!selectedBookId && currentView === 'profile' && (
  <ProfilePage
    settings={settings}
    user={user}
    onBack={() => setCurrentView('home')}
  />
)}
        {/* Add Book View */}
        {!selectedBookId && currentView === 'add-book' && (
          <div className="space-y-6">
            <h1 className={`text-4xl font-bold ${textClass} mb-8`}>Add New Book</h1>
            <AddBookForm
              onAdd={handleAddBook}
              onCancel={() => setCurrentView('home')}
              settings={settings}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;