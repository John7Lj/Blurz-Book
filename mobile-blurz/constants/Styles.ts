import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const createStyles = (darkMode: boolean) => {
    const colors = darkMode ? Colors.dark : Colors.light;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
        },
        cardLarge: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 5,
        },
        input: {
            backgroundColor: colors.inputBg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            color: colors.text,
        },
        button: {
            backgroundColor: colors.primary,
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
        buttonSecondary: {
            backgroundColor: colors.hover,
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonSecondaryText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        text: {
            color: colors.text,
            fontSize: 16,
        },
        textSecondary: {
            color: colors.textSecondary,
            fontSize: 14,
        },
        heading1: {
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.text,
        },
        heading2: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
        },
        heading3: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
        },
    });
};
