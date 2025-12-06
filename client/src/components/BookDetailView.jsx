import React, { useState, useEffect } from "react";
import { Star } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from "./LoadingSpinner";

const BookDetailView = ({ bookId, onBack, settings, showToast }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  const cardClass = settings.darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = settings.darkMode ? 'text-gray-400' : 'text-gray-600';

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const response = await api.get(`/book/${bookId}`);
      setBook(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.detail?.message || 
                       error.response?.data?.detail || 
                       error.message;
      showToast(errorMsg, 'error');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/add_review/${bookId}`, {
        rating: parseInt(reviewData.rating),
        comment: reviewData.comment,
      });
      showToast('Review added successfully!', 'success');
      setReviewData({ rating: 5, comment: '' });
      fetchBook();
    } catch (error) {
      const errorMsg = error.response?.data?.detail?.message || 
                       error.response?.data?.detail || 
                       error.message;
      showToast(errorMsg, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner darkMode={settings.darkMode} />
      </div>
    );
  }

  if (!book) return null;

  const avgRating = book.reviews?.length > 0
    ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} hover:opacity-80`}
      >
        ← Back
      </button>

      <div className={`${cardClass} rounded-xl shadow-lg p-8`}>
        <h1 className={`text-4xl font-bold ${textClass} mb-4`}>{book.title}</h1>
        <p className={`text-xl ${textSecondary} mb-2`}>by {book.author}</p>
        <p className={`${textSecondary} mb-4`}>{book.publisher} • {book.language}</p>
        
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-1">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span className={`text-2xl font-semibold ${textClass}`}>{avgRating}</span>
            <span className={textSecondary}>({book.reviews?.length || 0} reviews)</span>
          </div>
          <span className={textSecondary}>{book.page_count} pages</span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{book.category}</span>
        </div>

        <p className={`${textClass} leading-relaxed`}>{book.description}</p>
      </div>

      <div className={`${cardClass} rounded-xl shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>Add a Review</h2>
        <form onSubmit={handleAddReview} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Rating</label>
            <select
              value={reviewData.rating}
              onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none`}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Comment</label>
            <textarea
              required
              maxLength={80}
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none`}
              rows="3"
              placeholder="Share your thoughts..."
            />
            <p className={`text-sm ${textSecondary} mt-1`}>{reviewData.comment.length}/80 characters</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Submit Review
          </button>
        </form>
      </div>

      <div className={`${cardClass} rounded-xl shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold ${textClass} mb-6`}>Reviews</h2>
        {book.reviews?.length === 0 ? (
          <p className={textSecondary}>No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {book.reviews?.map((review) => (
              <div key={review.id} className={`border-b ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'} pb-4 last:border-0`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm ${textSecondary}`}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className={textClass}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailView;