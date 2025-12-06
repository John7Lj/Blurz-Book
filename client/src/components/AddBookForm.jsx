import React, { useState } from "react";


const AddBookForm = ({ onAdd, onCancel, settings }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    published_date: '',
    page_count: '',
    category: '',
    description: '',
    language: '',
  });

  const cardClass = settings.darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900';

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className={`${cardClass} rounded-xl shadow-lg p-8`}>
      <h2 className={`text-2xl font-bold ${textClass} mb-6`}>Add New Book</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${textClass} mb-2`}>Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Author *</label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Publisher *</label>
            <input
              type="text"
              required
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Category *</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Language *</label>
            <input
              type="text"
              required
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Page Count *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.page_count}
              onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Published Date *</label>
            <input
              type="date"
              required
              value={formData.published_date}
              onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium ${textClass} mb-2`}>Description *</label>
          <textarea
            required
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none`}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Add Book
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 py-3 rounded-lg font-semibold ${settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} hover:opacity-80 transition`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
export default AddBookForm;