import React,{useState} from "react";
import { Star } from "lucide-react";
const BookCard = ({ book, onClick, settings }) => {
  const avgRating = book.reviews?.length > 0
    ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length).toFixed(1)
    : 'N/A';

  const cardClass = settings.darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = settings.darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div 
      onClick={onClick}
      className={`${cardClass} rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 cursor-pointer transform hover:-translate-y-1`}
    >
      <h3 className={`text-xl font-bold ${textClass} mb-2 line-clamp-2`}>{book.title}</h3>
      <p className={`${textSecondary} mb-1`}>by {book.author}</p>
      <p className={`text-sm ${textSecondary} mb-2`}>{book.category}</p>
      <p className={`text-sm ${textClass} mb-4 line-clamp-2`}>{book.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className={`font-semibold ${textClass}`}>{avgRating}</span>
          <span className={`text-sm ${textSecondary}`}>({book.reviews?.length || 0})</span>
        </div>
        <span className={`text-sm ${textSecondary}`}>{book.page_count} pages</span>
      </div>
    </div>
  );
};

export default BookCard;