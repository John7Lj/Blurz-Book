import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const AuthPage = ({ onLogin, onSignup, settings, error }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      onSignup(formData);
    }
  };

  const bgClass = settings.darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100';
  const cardClass = settings.darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = settings.darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
      <div className={`${cardClass} rounded-2xl shadow-xl p-8 w-full max-w-md`}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="large" darkMode={settings.darkMode} />
          </div>
          <p className={textSecondary}>Manage your book collection</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${isLogin ? 'bg-blue-500 text-white' : `${settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${!isLogin ? 'bg-blue-500 text-white' : `${settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`
              }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textClass}`}>Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${textClass}`}>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${textClass}`}>Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {isLogin && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/reset-password')}
              className={`text-sm ${textSecondary} hover:${textClass} transition-colors`}
            >
              Forgot User/Password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;








// In Dashboard.jsx - Add this import at the top:

// Then replace the header logo section with:

