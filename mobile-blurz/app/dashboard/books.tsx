import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import BookCard from '@/components/BookCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Logo from '@/components/Logo';
import DarkModeToggle from '@/components/DarkModeToggle';
import useDarkMode from '@/hooks/useDarkMode';
import useToast from '@/hooks/useToast';
import api from '@/services/api';

interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    description: string;
    page_count: number;
    reviews?: Array<{ rating: number }>;
}

export default function AllBooksScreen() {
    const { showToast } = useToast();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const colors = darkMode ? Colors.dark : Colors.light;

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            const response = await api.get('/book/');
            setBooks(response.data);
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.detail?.message ||
                error.response?.data?.detail ||
                error.message;
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredBooks = books.filter(
        (book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <LoadingSpinner darkMode={darkMode} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Logo size="medium" darkMode={darkMode} />
                <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
            </View>

            {/* Title and Search */}
            <View style={styles.titleSection}>
                <Text style={[styles.title, { color: colors.text }]}>All Books</Text>
                <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search books..."
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
            </View>

            {/* Books List */}
            {filteredBooks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        {searchQuery ? 'No books found matching your search.' : 'No books available.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredBooks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <BookCard
                            book={item}
                            onPress={() => router.push(`/dashboard/book/${item.id}` as any)}
                            darkMode={darkMode}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    backButton: {
        padding: 4,
    },
    titleSection: {
        padding: 16,
        gap: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
