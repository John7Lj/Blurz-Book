import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
    user_id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    created_at?: string;
    role?: string;
    is_verified?: boolean;
}

interface Tokens {
    access_token: string;
    refresh_token: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User, tokens: Tokens) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const loadUser = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                const userData = await AsyncStorage.getItem('user_data');

                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                await AsyncStorage.clear();
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (userData: User, tokens: Tokens) => {
        try {
            await AsyncStorage.setItem('access_token', tokens.access_token);
            await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Error saving user data:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await AsyncStorage.clear();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
