import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK_MODE_KEY = '@blurz_books_dark_mode';

export default function useDarkMode() {
    const [darkMode, setDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load dark mode preference on mount
    useEffect(() => {
        loadDarkModePreference();
    }, []);

    const loadDarkModePreference = async () => {
        try {
            const value = await AsyncStorage.getItem(DARK_MODE_KEY);
            if (value !== null) {
                setDarkMode(value === 'true');
            }
        } catch (error) {
            console.error('Error loading dark mode preference:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDarkMode = async () => {
        try {
            const newValue = !darkMode;
            setDarkMode(newValue);
            await AsyncStorage.setItem(DARK_MODE_KEY, String(newValue));
        } catch (error) {
            console.error('Error saving dark mode preference:', error);
        }
    };

    return { darkMode, toggleDarkMode, isLoading };
}
