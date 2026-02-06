import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    darkMode?: boolean;
    showText?: boolean;
}

export default function Logo({ size = 'medium', darkMode = false, showText = true }: LogoProps) {
    const colors = darkMode ? Colors.dark : Colors.light;

    // Match client sizes: small: 24x24, medium: 32x32, large: 48x48
    const imageSize = size === 'small' ? 24 : size === 'medium' ? 32 : 48;
    const fontSize = size === 'small' ? 18 : size === 'medium' ? 20 : 24;

    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/images/android-chrome-512x512.png')}
                style={[styles.image, { width: imageSize, height: imageSize }]}
                resizeMode="contain"
            />
            {showText && (
                <Text style={[styles.text, { fontSize, color: darkMode ? colors.text : '#111827' }]}>
                    Blurz Books
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    image: {
        // Size is set dynamically
    },
    text: {
        fontWeight: 'bold',
    },
});
