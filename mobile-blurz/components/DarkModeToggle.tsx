import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface DarkModeToggleProps {
    darkMode: boolean;
    onToggle: () => void;
}

export default function DarkModeToggle({ darkMode, onToggle }: DarkModeToggleProps) {
    const colors = darkMode ? Colors.dark : Colors.light;

    return (
        <TouchableOpacity
            onPress={onToggle}
            style={[styles.button, { backgroundColor: colors.hover }]}
            activeOpacity={0.7}
        >
            <Ionicons
                name={darkMode ? 'sunny' : 'moon'}
                size={20}
                color={darkMode ? '#FBBF24' : '#6B7280'}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 8,
        borderRadius: 8,
    },
});
