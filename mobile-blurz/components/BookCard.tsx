import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    description: string;
    page_count: number;
    reviews?: Array<{ rating: number }>;
}

interface BookCardProps {
    book: Book;
    onPress: () => void;
    darkMode?: boolean;
}

export default function BookCard({ book, onPress, darkMode = false }: BookCardProps) {
    const colors = darkMode ? Colors.dark : Colors.light;

    const avgRating = book.reviews && book.reviews.length > 0
        ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length).toFixed(1)
        : 'N/A';

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.card, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
        >
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                {book.title}
            </Text>
            <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
                by {book.author}
            </Text>
            <Text style={[styles.category, { color: colors.textSecondary }]} numberOfLines={1}>
                {book.category}
            </Text>
            <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
                {book.description}
            </Text>

            <View style={styles.footer}>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#EAB308" />
                    <Text style={[styles.rating, { color: colors.text }]}>{avgRating}</Text>
                    <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                        ({book.reviews?.length || 0})
                    </Text>
                </View>
                <Text style={[styles.pageCount, { color: colors.textSecondary }]}>
                    {book.page_count} pages
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    author: {
        fontSize: 14,
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
    },
    reviewCount: {
        fontSize: 12,
    },
    pageCount: {
        fontSize: 12,
    },
});
