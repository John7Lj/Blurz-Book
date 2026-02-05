import React, { useState } from 'react';
import { User, Mail, Calendar, BookOpen, Edit2, Save, X } from 'lucide-react';
import api from '../services/api';

const ProfilePage = ({ settings, user, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  const cardClass = settings.darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = settings.darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200';

  const handleSave = () => {
    // TODO: Add API call to update user profile
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handlePasswordUpdate = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords don't match!");
      return;
    }

    try {
      await api.post('/auth/change_password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      alert('Password updated successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      const errorMsg = error.response?.data?.detail?.message ||
        error.response?.data?.detail ||
        error.message;
      alert(`Error updating password: ${errorMsg}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className={`px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} hover:opacity-80`}
      >
        ← Back to Dashboard
      </button>

      {/* Profile Header */}
      <div className={`${cardClass} rounded-xl shadow-lg p-8`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
              <User className={`w-10 h-10 ${textSecondary}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${textClass}`}>
                {user?.username}
              </h1>
              <p className={textSecondary}>{user?.email}</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className={`px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} hover:opacity-80 flex items-center gap-2`}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className={`border-t ${borderClass} pt-6 space-y-4`}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${borderClass} focus:ring-2 focus:ring-blue-500 outline-none`}
                />
              ) : (
                <p className={`${textClass} text-lg`}>{user?.username}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Email
              </label>
              <p className={`${textClass} text-lg flex items-center gap-2`}>
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${borderClass} focus:ring-2 focus:ring-blue-500 outline-none`}
                />
              ) : (
                <p className={`${textClass} text-lg`}>{user?.first_name || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${borderClass} focus:ring-2 focus:ring-blue-500 outline-none`}
                />
              ) : (
                <p className={`${textClass} text-lg`}>{user?.last_name || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Calendar className={`w-5 h-5 ${textSecondary}`} />
              <div>
                <p className={`text-sm ${textSecondary}`}>Member Since</p>
                <p className={textClass}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className={`w-5 h-5 ${textSecondary}`} />
              <div>
                <p className={`text-sm ${textSecondary}`}>Account Role</p>
                <p className={textClass}>{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className={`${cardClass} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={textSecondary}>Books Added</p>
              <p className={`text-2xl font-bold ${textClass}`}>0</p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Edit2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className={textSecondary}>Reviews Written</p>
              <p className={`text-2xl font-bold ${textClass}`}>0</p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className={textSecondary}>Account Status</p>
              <p className={`text-2xl font-bold ${textClass}`}>
                {user?.is_verifed ? 'Verified' : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className={`${cardClass} rounded-xl shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${borderClass} focus:ring-2 focus:ring-blue-500 outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              New Password
            </label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${borderClass} focus:ring-2 focus:ring-blue-500 outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${borderClass} focus:ring-2 focus:ring-blue-500 outline-none`}
            />
          </div>
          <button
            onClick={handlePasswordUpdate}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;