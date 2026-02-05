import React, { useState } from 'react';
import api from '../services/api';

const UploadEbookForm = ({ bookId, onSuccess, settings }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        // Client-side validation
        const allowedTypes = ['application/pdf', 'application/epub+zip'];
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|epub|mobi)$/i)) {
            setError('Only PDF, EPUB, and MOBI files are allowed');
            return;
        }

        if (selectedFile.size > maxSize) {
            setError('File is too large (max 50MB)');
            return;
        }

        setError('');
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(`/book/upload_ebook/${bookId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (onSuccess) {
                onSuccess(response.data);
            }
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const cardClass = settings?.darkMode ? 'bg-gray-800' : 'bg-white';
    const textClass = settings?.darkMode ? 'text-white' : 'text-gray-900';

    return (
        <div className={`${cardClass} rounded-xl shadow-lg p-6`}>
            <h3 className={`text-xl font-bold ${textClass} mb-4`}>Upload Ebook File</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            )}

            <input
                type="file"
                accept=".pdf,.epub,.mobi"
                onChange={handleFileChange}
                className="mb-4 w-full"
                disabled={uploading}
            />

            {file && (
                <div className={`mb-4 ${textClass}`}>
                    <p>Selected: {file.name}</p>
                    <p className="text-sm opacity-70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? 'Uploading...' : 'Upload Ebook'}
            </button>
        </div>
    );
};

export default UploadEbookForm;
