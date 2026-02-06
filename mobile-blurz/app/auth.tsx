import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Href } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import LoadingSpinner from '@/components/LoadingSpinner';
import useToast from '@/hooks/useToast';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';

export default function AuthPage() {
    const { login } = useAuth();
    const { showToast } = useToast();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [darkMode] = useState(false); // TODO: Connect to settings
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        first_name: '',
        last_name: '',
    });

    const colors = darkMode ? Colors.dark : Colors.light;

    const handleSubmit = async () => {
        if (isLogin) {
            await handleLogin();
        } else {
            await handleSignup();
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                email: formData.email.trim(),
                password: formData.password,
            });

            const { access_token, refresh_token, username, user_id, email } = response.data;

            if (!access_token || !refresh_token) {
                throw new Error('Tokens not received from server');
            }

            const userData = { user_id, username, email };
            const tokens = { access_token, refresh_token };

            await login(userData, tokens);
            showToast('Login successful!', 'success');
            router.replace('/dashboard/' as Href);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail?.message ||
                error.response?.data?.detail ||
                error.response?.data?.message ||
                error.userMessage ||
                error.message ||
                'Login failed. Please check your credentials.';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        setLoading(true);
        try {
            await api.post('/auth/signup', {
                ...formData,
                email: formData.email.trim(),
            });
            showToast('Account created! Please check your email to verify your account.', 'success');
            setIsLogin(true);
            setFormData({ email: '', password: '', username: '', first_name: '', last_name: '' });
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail?.message ||
                error.response?.data?.detail ||
                error.response?.data?.message ||
                'Signup failed. Please try again.';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <LoadingSpinner darkMode={darkMode} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Logo size="large" darkMode={darkMode} />
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Manage your book collection
                    </Text>

                    {/* Toggle Buttons */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            onPress={() => setIsLogin(true)}
                            style={[
                                styles.toggleButton,
                                isLogin ? { backgroundColor: colors.primary } : { backgroundColor: colors.hover },
                            ]}
                        >
                            <Text style={[styles.toggleText, { color: isLogin ? '#FFFFFF' : colors.text }]}>
                                Sign In
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsLogin(false)}
                            style={[
                                styles.toggleButton,
                                !isLogin ? { backgroundColor: colors.primary } : { backgroundColor: colors.hover },
                            ]}
                        >
                            <Text style={[styles.toggleText, { color: !isLogin ? '#FFFFFF' : colors.text }]}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    {!isLogin && (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>Username</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                    value={formData.username}
                                    onChangeText={(text) => setFormData({ ...formData, username: text })}
                                    autoCapitalize="none"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.rowContainer}>
                                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                        value={formData.first_name}
                                        onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                                        autoCapitalize="words"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>

                                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                        value={formData.last_name}
                                        onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                                        autoCapitalize="words"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="you@example.com"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry
                            placeholder="••••••••"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    >
                        <Text style={styles.submitButtonText}>
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>

                    {isLogin && (
                        <TouchableOpacity onPress={() => router.push('/reset-password')}>
                            <Text style={[styles.forgotPassword, { color: colors.textSecondary }]}>
                                Forgot User/Password?
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
    },
    card: {
        borderRadius: 16,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    subtitle: {
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
        fontSize: 14,
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    toggleButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 16,
    },
    rowContainer: {
        flexDirection: 'row',
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
    submitButton: {
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    forgotPassword: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 14,
    },
});
