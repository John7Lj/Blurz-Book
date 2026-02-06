import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Linking, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import useToast from '@/hooks/useToast';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface Book {
    id: string;
    title: string;
    author: string;
    publisher: string;
    published_date: string;
    page_count: number;
    category: string;
    description: string;
    language: string;
    file_path?: string;
    file_type?: string;
    file_size?: number;
    user_id: string;
    reviews?: Review[];
}

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams();
    const { showToast } = useToast();
    const [darkMode] = useState(false);
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

    const colors = darkMode ? Colors.dark : Colors.light;

    useEffect(() => {
        fetchBook();
    }, [id]);

    const fetchBook = async () => {
        try {
            const response = await api.get(`/book/${id}`);
            setBook(response.data);
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.detail?.message ||
                error.response?.data?.detail ||
                error.message;
            showToast(errorMsg, 'error');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleAddReview = async () => {
        try {
            await api.post(`/reviews/add_review/${id}`, {
                rating: parseInt(reviewData.rating.toString()),
                comment: reviewData.comment,
            });
            showToast('Review added successfully!', 'success');
            setReviewData({ rating: 5, comment: '' });
            fetchBook();
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.detail?.message ||
                error.response?.data?.detail ||
                error.message;
            showToast(errorMsg, 'error');
        }
    };

    const handleDownload = async () => {
        if (!book?.file_path || !book?.file_type) {
            showToast('No file available for download', 'error');
            return;
        }

        setDownloading(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                showToast('Please login first', 'error');
                setDownloading(false);
                return;
            }

            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.11:8000/api/v1';
            const downloadUrl = `${apiUrl}/book/download_ebook/${book.id}`;

            const filename = `${book.title.replace(/[^a-z0-9]/gi, '_')}.${book.file_type}`;
            const fileUri = `${FileSystem.cacheDirectory}${filename}`;

            // Use legacy downloadAsync (it works reliably)
            const downloadResult = await FileSystem.downloadAsync(
                downloadUrl,
                fileUri,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (downloadResult.status === 200) {
                showToast('Book downloaded successfully!', 'success');

                Alert.alert(
                    'Download Complete',
                    'Would you like to open the book?',
                    [
                        { text: 'Later', style: 'cancel' },
                        {
                            text: 'Open',
                            onPress: () => handleViewBook(downloadResult.uri)
                        },
                    ]
                );
            } else {
                showToast('Download failed', 'error');
            }
        } catch (error: any) {
            console.error('Download error:', error);
            showToast('Failed to download book: ' + error.message, 'error');
        } finally {
            setDownloading(false);
        }
    };

    const handleViewBook = async (fileUri?: string) => {
        try {
            let uri = fileUri;
            if (!uri && book) {
                const filename = `${book.title.replace(/[^a-z0-9]/gi, '_')}.${book.file_type}`;
                uri = `${FileSystem.cacheDirectory}${filename}`;
            }

            if (!uri) {
                showToast('File path not available', 'error');
                return;
            }

            // Check if file exists
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                showToast('File not found. Please download first.', 'error');
                return;
            }

            // Android requires IntentLauncher to open files properly
            if (Platform.OS === 'android') {
                try {
                    const contentUri = await FileSystem.getContentUriAsync(uri);
                    const mimeType = book?.file_type === 'pdf' ? 'application/pdf' : 'application/epub+zip';

                    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                        data: contentUri,
                        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
                        type: mimeType,
                    });
                } catch (intentError: any) {
                    console.error('Intent launch failed:', intentError);
                    // Fallback to sharing if intent fails
                    const canShare = await Sharing.isAvailableAsync();
                    if (canShare) {
                        await Sharing.shareAsync(uri);
                    } else {
                        showToast('Cannot open file on this device', 'error');
                    }
                }
            } else {
                // iOS can use Linking directly
                const fileUrl = uri.startsWith('file://') ? uri : `file://${uri}`;
                const supported = await Linking.canOpenURL(fileUrl);

                if (supported) {
                    await Linking.openURL(fileUrl);
                } else {
                    showToast('No app available to open this file type', 'error');
                }
            }
        } catch (error: any) {
            console.error('View error:', error);
            showToast('Failed to open book: ' + error.message, 'error');
        }
    };

    const handleShareBook = async () => {
        try {
            if (!book?.file_path || !book?.file_type) {
                showToast('No file available to share', 'error');
                return;
            }

            const filename = `${book.title.replace(/[^a-z0-9]/gi, '_')}.${book.file_type}`;
            const uri = `${FileSystem.cacheDirectory}${filename}`;

            // Check if file exists
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                showToast('File not found. Please download first.', 'error');
                return;
            }

            // Use expo-sharing to share the file
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(uri, {
                    dialogTitle: `Share ${book.title}`,
                    mimeType: book.file_type === 'pdf' ? 'application/pdf' : 'application/epub+zip',
                });
            } else {
                showToast('Sharing is not available on this device', 'error');
            }
        } catch (error: any) {
            console.error('Share error:', error);
            showToast('Failed to share book: ' + error.message, 'error');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <LoadingSpinner darkMode={darkMode} />
            </View>
        );
    }

    if (!book) return null;

    const avgRating =
        book.reviews && book.reviews.length > 0
            ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length).toFixed(1)
            : 'N/A';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={{ fontSize: 24 }}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Book Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Book Details Card */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
                    <Text style={[styles.author, { color: colors.textSecondary }]}>by {book.author}</Text>
                    <Text style={[styles.publisher, { color: colors.textSecondary }]}>
                        {book.publisher} • {book.language}
                    </Text>

                    <View style={styles.ratingSection}>
                        <View style={styles.ratingRow}>
                            <Text style={styles.star}>⭐</Text>
                            <Text style={[styles.avgRating, { color: colors.text }]}>{avgRating}</Text>
                            <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                                ({book.reviews?.length || 0} reviews)
                            </Text>
                        </View>
                        <Text style={[styles.pageCount, { color: colors.textSecondary }]}>
                            {book.page_count} pages
                        </Text>
                        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '30' }]}>
                            <Text style={[styles.categoryText, { color: colors.primary }]}>{book.category}</Text>
                        </View>
                    </View>

                    <Text style={[styles.description, { color: colors.text }]}>{book.description}</Text>

                    {/* File Actions */}
                    {book.file_path && (
                        <View style={[styles.fileSection, { backgroundColor: colors.hover, borderColor: colors.border }]}>
                            <Text style={[styles.fileTitle, { color: colors.text }]}>📄 Ebook Available</Text>
                            <Text style={[styles.fileInfo, { color: colors.textSecondary }]}>
                                {book.file_type?.toUpperCase()} • {(book.file_size! / 1024 / 1024).toFixed(2)} MB
                            </Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    onPress={handleDownload}
                                    disabled={downloading}
                                    style={[styles.actionButton, { backgroundColor: downloading ? colors.hover : colors.success, flex: 1, marginRight: 4 }]}
                                >
                                    <Text style={[styles.actionButtonText, { color: downloading ? colors.textSecondary : '#FFFFFF' }]}>
                                        {downloading ? '⏳ Downloading...' : '📥 Download'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleViewBook()}
                                    style={[styles.actionButton, { backgroundColor: colors.primary, flex: 1, marginHorizontal: 4 }]}
                                >
                                    <Text style={styles.actionButtonText}>👁️ View</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleShareBook()}
                                    style={[styles.actionButton, { backgroundColor: '#3b82f6', flex: 1, marginLeft: 4 }]}
                                >
                                    <Text style={styles.actionButtonText}>📤 Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Add Review Section */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Add a Review</Text>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Rating</Text>
                        <View style={styles.ratingButtons}>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    onPress={() => setReviewData({ ...reviewData, rating: num })}
                                    style={[
                                        styles.ratingButton,
                                        {
                                            backgroundColor: reviewData.rating === num ? colors.primary : colors.hover,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.ratingButtonText,
                                            { color: reviewData.rating === num ? '#FFFFFF' : colors.text },
                                        ]}
                                    >
                                        {num}⭐
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Comment</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                            value={reviewData.comment}
                            onChangeText={(text) => setReviewData({ ...reviewData, comment: text })}
                            multiline
                            numberOfLines={3}
                            maxLength={80}
                            placeholder="Share your thoughts..."
                            placeholderTextColor={colors.textSecondary}
                            textAlignVertical="top"
                        />
                        <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                            {reviewData.comment.length}/80 characters
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleAddReview}
                        style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    >
                        <Text style={styles.submitButtonText}>Submit Review</Text>
                    </TouchableOpacity>
                </View>

                {/* Reviews Section */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Reviews ({book.reviews?.length || 0})
                    </Text>

                    {!book.reviews || book.reviews.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No reviews yet. Be the first to review!
                        </Text>
                    ) : (
                        <View>
                            {book.reviews.map((review) => (
                                <View key={review.id} style={[styles.reviewCard, { borderBottomColor: colors.border }]}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.starsRow}>
                                            {[...Array(5)].map((_, i) => (
                                                <Text key={i} style={styles.starIcon}>
                                                    {i < review.rating ? '⭐' : '☆'}
                                                </Text>
                                            ))}
                                        </View>
                                        <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text style={[styles.reviewComment, { color: colors.text }]}>{review.comment}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
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
    },
    backButton: {
        width: 40,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    author: {
        fontSize: 18,
        marginBottom: 4,
    },
    publisher: {
        fontSize: 14,
        marginBottom: 16,
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        fontSize: 20,
        marginRight: 4,
    },
    avgRating: {
        fontSize: 20,
        fontWeight: '600',
        marginRight: 4,
    },
    reviewCount: {
        fontSize: 14,
    },
    pageCount: {
        fontSize: 14,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    fileSection: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
    },
    fileTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    fileInfo: {
        fontSize: 12,
        marginBottom: 12,
    },
    downloadButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    downloadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    ratingButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    ratingButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    ratingButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 80,
    },
    charCount: {
        fontSize: 12,
        marginTop: 4,
    },
    submitButton: {
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 16,
    },
    reviewCard: {
        borderBottomWidth: 1,
        paddingBottom: 16,
        marginBottom: 16,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    starsRow: {
        flexDirection: 'row',
    },
    starIcon: {
        fontSize: 14,
    },
    reviewDate: {
        fontSize: 12,
    },
    reviewComment: {
        fontSize: 14,
    },
});
