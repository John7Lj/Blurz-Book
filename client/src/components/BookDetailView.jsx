import React, { useState, useEffect } from "react";
import { Star, Upload, Download, FileText, AlertCircle, Book, X } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from "./LoadingSpinner";

const BookDetailView = ({ bookId, onBack, settings, showToast }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showReader, setShowReader] = useState(false);

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/epub+zip'];
    const allowedExtensions = /\.(pdf|epub|mobi|azw|azw3)$/i;

    if (!allowedTypes.includes(file.type) && !file.name.match(allowedExtensions)) {
      showToast('Only PDF, EPUB, MOBI, AZW, and AZW3 files are allowed', 'error');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('File size must be less than 50MB', 'error');
      return;
    }

    setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      await api.post(`/book/upload_ebook/${bookId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Ebook uploaded successfully!', 'success');
      setUploadFile(null);
      fetchBook();
    } catch (error) {
      const errorMsg = error.response?.data?.detail?.message ||
        error.response?.data?.detail ||
        error.message;
      showToast(errorMsg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!book?.file_path) return;

    setDownloading(true);
    try {
      const response = await api.get(`/book/download_ebook/${bookId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${book.title}.${book.file_type || 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Download started!', 'success');
    } catch (error) {
      const errorMsg = error.response?.data?.detail?.message ||
        error.response?.data?.detail ||
        error.message;
      showToast(errorMsg, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleReadBook = async () => {
    if (!book?.file_path) return;

    try {
      const response = await api.get(`/book/download_ebook/${bookId}`, {
        responseType: 'blob',
      });

      const fileBlob = new Blob([response.data], {
        type: book.file_type === 'pdf' ? 'application/pdf' : 'application/epub+zip'
      });
      const fileUrl = window.URL.createObjectURL(fileBlob);

      // Open in new tab for better mobile support
      window.open(fileUrl, '_blank');

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

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const isOwner = book.user_id === userData.user_id;

  // Reader Modal
  if (showReader) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="h-full flex flex-col">
          <div className={`${cardClass} p-4 flex items-center justify-between border-b ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold ${textClass}`}>Reading: {book.title}</h2>
            <button
              onClick={() => {
                window.URL.revokeObjectURL(showReader);
                setShowReader(false);
              }}
              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1">
            {book.file_type === 'pdf' ? (
              <iframe
                src={showReader}
                className="w-full h-full"
                title={book.title}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className={textClass}>
                    EPUB/MOBI reader coming soon!
                  </p>
                  <p className={textSecondary}>
                    For now, please download the file to read it.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Download to Read
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} hover:opacity-80`}
      >
        ← Back
      </button>

      {/* Book Details */}
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

        <p className={`${textClass} leading-relaxed mb-6`}>{book.description}</p>

        {/* File Actions */}
        {book.file_path && (
          <div className={`border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-6 bg-gradient-to-r ${settings.darkMode ? 'from-gray-700 to-gray-800' : 'from-blue-50 to-purple-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={`font-bold ${textClass} text-lg`}>Ebook Available</p>
                  <p className={`text-sm ${textSecondary}`}>
                    {book.file_type?.toUpperCase()} • {(book.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {book.file_type === 'pdf' && (
                <button
                  onClick={handleReadBook}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold"
                >
                  <Book className="w-5 h-5" />
                  Read Now
                </button>
              )}

              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 ${book.file_type === 'pdf' ? '' : 'col-span-3'}`}
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Downloading...' : 'Download'}
              </button>

              {book.file_type !== 'pdf' && (
                <div className={`col-span-3 text-center text-sm ${textSecondary} mt-2`}>
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  EPUB/MOBI files can be downloaded and read in your preferred ebook reader
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Section (Only for book owner) */}
      {isOwner && !book.file_path && (
        <div className={`${cardClass} rounded-xl shadow-lg p-8`}>
          <h2 className={`text-2xl font-bold ${textClass} mb-4 flex items-center gap-2`}>
            <Upload className="w-6 h-6" />
            Upload Ebook File
          </h2>

          <div className={`mb-4 p-4 bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-600">
                <p className="font-medium mb-1">Supported formats:</p>
                <p>PDF (readable online), EPUB, MOBI, AZW, AZW3 (download only) - Max 50MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`border-2 border-dashed ${settings.darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-8 text-center`}>
              <Upload className={`w-12 h-12 mx-auto mb-4 ${textSecondary}`} />
              <input
                type="file"
                accept=".pdf,.epub,.mobi,.azw,.azw3"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
              >
                Choose File
              </label>
              <p className={`mt-2 text-sm ${textSecondary}`}>
                or drag and drop your ebook here
              </p>
            </div>

            {uploadFile && (
              <div className={`${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 border-l-4 border-blue-500`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`${textClass} font-semibold mb-1 flex items-center gap-2`}>
                      <FileText className="w-5 h-5 text-blue-500" />
                      Selected file:
                    </p>
                    <p className={`${textClass} mb-1`}>{uploadFile.name}</p>
                    <p className={`text-sm ${textSecondary}`}>
                      Size: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadFile(null)}
                    className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <X className={`w-5 h-5 ${textSecondary}`} />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
              className="w-full bg-blue-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-6 h-6" />
              {uploading ? 'Uploading...' : 'Upload Ebook'}
            </button>
          </div>
        </div>
      )}

      {/* Add Review Section */}
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
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Submit Review
          </button>
        </form>
      </div>

      {/* Reviews Section */}
      <div className={`${cardClass} rounded-xl shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold ${textClass} mb-6`}>Reviews ({book.reviews?.length || 0})</h2>
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