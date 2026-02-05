import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Logo from './Logo';

const ResetPasswordPage = ({ settings }) => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [passwordData, setPasswordData] = useState({ new_password: '', confirm_password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const bgClass = settings.darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100';
    const cardClass = settings.darkMode ? 'bg-gray-800' : 'bg-white';
    const textClass = settings.darkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = settings.darkMode ? 'text-gray-400' : 'text-gray-600';

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/password_reset', { email });
            setMessage({ type: 'success', text: 'If an account exists with this email, a reset link has been sent.' });
        } catch (error) {
            console.error(error)
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: "Passwords don't match" });
            return;
        }

        setLoading(true);
        try {
            await api.post(`/auth/confirm_password/${token}`, {
                new_password: passwordData.new_password,
                confirm_password: passwordData.confirm_password
            });
            setMessage({ type: 'success', text: 'Password reset successfully! Redirecting to login...' });
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.detail?.message ||
                error.response?.data?.detail ||
                error.message;
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
            <div className={`${cardClass} rounded-2xl shadow-xl p-8 w-full max-w-md`}>
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size="large" darkMode={settings.darkMode} />
                    </div>
                    <h2 className={`text-2xl font-bold ${textClass} mb-2`}>
                        {token ? 'Reset Password' : 'Forgot Password'}
                    </h2>
                    <p className={textSecondary}>
                        {token ? 'Enter your new password below' : 'Enter your email to receive a reset link'}
                    </p>
                </div>

                {message.text && (
                    <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500 bg-opacity-10 border border-green-500 text-green-500' : 'bg-red-500 bg-opacity-10 border border-red-500 text-red-500'}`}>
                        <p className="text-sm">{message.text}</p>
                    </div>
                )}

                {token ? (
                    <form onSubmit={handleConfirmReset} className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${textClass}`}>New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${textClass}`}>Confirm Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${textClass}`}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                                placeholder="you@example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className={`text-sm ${textSecondary} hover:${textClass} transition-colors`}
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
