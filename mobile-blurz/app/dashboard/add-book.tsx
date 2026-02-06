import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import Logo from '@/components/Logo';
import DarkModeToggle from '@/components/DarkModeToggle';
import useDarkMode from '@/hooks/useDarkMode';
import useToast from '@/hooks/useToast';
import api from '@/services/api';

export default function AddBookScreen() {
    const { showToast } = useToast();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [uploadProgress, setUploadProgress] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        publisher: '',
        published_date: '',
        page_count: '',
        category: '',
        description: '',
        language: '',
    });

    const colors = darkMode ? Colors.dark : Colors.light;

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/epub+zip'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setSelectedFile(file);
                showToast(`Selected: ${file.name}`, 'success');
            }
        } catch (error: any) {
            showToast('Failed to pick file', 'error');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Parse and validate the date
            let publishedDate: string;
            if (formData.published_date) {
                // Try to parse the date input (supports MM/DD/YYYY, YYYY-MM-DD, etc.)
                const dateObj = new Date(formData.published_date);
                if (isNaN(dateObj.getTime())) {
                    showToast('Invalid date format. Use MM/DD/YYYY or YYYY-MM-DD', 'error');
                    setLoading(false);
                    return;
                }
                // Convert to naive datetime (without timezone) for PostgreSQL
                // Format: YYYY-MM-DDTHH:MM:SS (no 'Z' at the end)
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                publishedDate = `${year}-${month}-${day}T00:00:00`;
            } else {
                // Use current date as naive datetime
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                publishedDate = `${year}-${month}-${day}T00:00:00`;
            }

            const bookData = {
                ...formData,
                published_date: publishedDate,
                page_count: parseInt(formData.page_count) || 0,
            };

            // Create the book first
            let bookId;
            try {
                const response = await api.post('/book/create_book', bookData);
                bookId = response.data.id;
                console.log('Book created successfully:', bookId);
            } catch (createError: any) {
                // Book creation failed - show detailed error
                let errorMsg = 'Failed to add book';

                // Handle FastAPI validation errors (422)
                if (createError.response?.status === 422 && createError.response?.data?.detail) {
                    const details = createError.response.data.detail;
                    if (Array.isArray(details)) {
                        errorMsg = details.map(err => {
                            const field = err.loc ? err.loc.join('.') : 'field';
                            return `${field}: ${err.msg || JSON.stringify(err)}`;
                        }).join('; ');
                    } else if (typeof details === 'string') {
                        errorMsg = details;
                    } else if (details.message) {
                        errorMsg = details.message;
                    }
                } else {
                    errorMsg = createError.response?.data?.detail?.message ||
                        createError.response?.data?.detail ||
                        createError.userMessage ||
                        createError.message ||
                        'Failed to add book';
                }

                showToast(errorMsg, 'error');
                setLoading(false);
                return; // Stop here, don't continue
            }

            // Upload file if selected (only if book was created successfully)
            if (selectedFile) {
                setUploadProgress(true);
                try {
                    console.log('=== FILE UPLOAD DEBUG START ===');
                    console.log('1. Book ID:', bookId);
                    console.log('2. Selected file:', selectedFile);
                    console.log('3. File URI:', selectedFile.uri);
                    console.log('4. File name:', selectedFile.name);
                    console.log('5. File type:', selectedFile.mimeType);
                    console.log('6. File size:', selectedFile.size);

                    // Check API URL
                    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.11:8000/api/v1';
                    console.log('7. API Base URL:', apiUrl);
                    console.log('8. Full upload URL:', `${apiUrl}/book/upload_ebook/${bookId}`);

                    // Test basic connectivity first
                    console.log('9. Testing API connectivity...');
                    try {
                        const pingResponse = await api.get('/book/');
                        console.log('10. API is reachable, books count:', pingResponse.data?.length || 0);
                    } catch (pingError: any) {
                        console.error('11. API CONNECTIVITY FAILED:', pingError.message);
                        showToast('Cannot connect to server. Check network.', 'error');
                        setUploadProgress(false);
                        return;
                    }

                    console.log('12. Getting auth token...');
                    const token = await AsyncStorage.getItem('access_token');
                    if (!token) {
                        showToast('Please login first', 'error');
                        setUploadProgress(false);
                        return;
                    }
                    console.log('13. Token retrieved');

                    console.log('14. Creating FormData...');
                    const formDataUpload = new FormData();

                    // React Native FormData needs the file object with specific properties
                    const fileToUpload: any = {
                        uri: selectedFile.uri,
                        name: selectedFile.name,
                        type: selectedFile.mimeType || (selectedFile.name.endsWith('.epub') ? 'application/epub+zip' : 'application/pdf'),
                    };

                    console.log('15. File object:', JSON.stringify(fileToUpload));
                    formDataUpload.append('file', fileToUpload);

                    // Use FETCH instead of AXIOS - axios uses XMLHttpRequest which doesn't handle multipart in RN
                    const uploadUrl = `${apiUrl}/book/upload_ebook/${bookId}`;
                    console.log('16. Upload URL:', uploadUrl);
                    console.log('17. Starting fetch upload (not axios)...');

                    const uploadResponse = await fetch(uploadUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            // Don't set Content-Type - fetch will add it with boundary automatically
                        },
                        body: formDataUpload,
                    });

                    console.log('18. Response status:', uploadResponse.status);
                    console.log('19. Response OK:', uploadResponse.ok);

                    if (!uploadResponse.ok) {
                        const errorData = await uploadResponse.json().catch(() => ({ detail: 'Upload failed' }));
                        console.error('20. Upload failed with data:', errorData);
                        throw new Error(errorData.detail?.message || errorData.detail || 'Upload failed');
                    }

                    const responseData = await uploadResponse.json();
                    console.log('21. Upload successful! Response:', responseData);
                    showToast('Book and file uploaded successfully!', 'success');
                    console.log('=== FILE UPLOAD DEBUG END ===');

                } catch (uploadError: any) {
                    console.error('=== FILE UPLOAD ERROR ===');
                    console.error('Error:', uploadError);
                    console.error('Error message:', uploadError.message);
                    showToast('Upload failed: ' + uploadError.message, 'error');
                    console.error('=== FILE UPLOAD ERROR END ===');
                } finally {
                    setUploadProgress(false);
                }
            } else {
                showToast('Book added successfully!', 'success');
            }

            router.push('/dashboard/my-books');
        } catch (error: any) {
            // This should only catch router.push errors or other unexpected issues
            console.error('Unexpected error:', error);
            showToast('An unexpected error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Logo size="medium" darkMode={darkMode} />
                <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
            </View>

            <View style={styles.titleSection}>
                <Text style={[styles.title, { color: colors.text }]}>Add New Book</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.rowContainer}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                            <Text style={[styles.label, { color: colors.text }]}>Author *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                value={formData.author}
                                onChangeText={(text) => setFormData({ ...formData, author: text })}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                            <Text style={[styles.label, { color: colors.text }]}>Publisher *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                value={formData.publisher}
                                onChangeText={(text) => setFormData({ ...formData, publisher: text })}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                    </View>

                    <View style={styles.rowContainer}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                            <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                value={formData.category}
                                onChangeText={(text) => setFormData({ ...formData, category: text })}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                            <Text style={[styles.label, { color: colors.text }]}>Language *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                value={formData.language}
                                onChangeText={(text) => setFormData({ ...formData, language: text })}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                    </View>

                    <View style={styles.rowContainer}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                            <Text style={[styles.label, { color: colors.text }]}>Page Count *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                value={formData.page_count}
                                onChangeText={(text) => setFormData({ ...formData, page_count: text })}
                                keyboardType="numeric"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                            <Text style={[styles.label, { color: colors.text }]}>Published Date *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                value={formData.published_date}
                                onChangeText={(text) => setFormData({ ...formData, published_date: text })}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Upload Ebook File (Optional)</Text>
                        <TouchableOpacity
                            onPress={handlePickFile}
                            style={[styles.filePickerButton, { backgroundColor: colors.hover, borderColor: colors.border }]}
                        >
                            <Text style={{ color: colors.text, fontSize: 14 }}>
                                {selectedFile ? `📄 ${selectedFile.name}` : '📁 Choose PDF/EPUB'}
                            </Text>
                        </TouchableOpacity>
                        {uploadProgress && (
                            <View style={styles.uploadingIndicator}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={[styles.uploadingText, { color: colors.textSecondary }]}>
                                    Uploading file...
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            style={[styles.submitButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
                        >
                            <Text style={styles.submitButtonText}>{loading ? 'Adding...' : 'Add Book'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={[styles.cancelButton, { backgroundColor: colors.hover }]}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
        paddingBottom: 0,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        borderRadius: 12,
        padding: 24,
    },
    inputContainer: {
        marginBottom: 16,
    },
    rowContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 100,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    submitButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    filePickerButton: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    uploadingText: {
        fontSize: 14,
    },
});
