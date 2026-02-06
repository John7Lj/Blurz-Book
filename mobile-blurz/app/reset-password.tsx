import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import Logo from '@/components/Logo';
import useToast from '@/hooks/useToast';
import api from '@/services/api';

export default function ResetPasswordScreen() {
    const { showToast } = useToast();
    const [darkMode] = useState(false);
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const colors = darkMode ? Colors.dark : Colors.light;

    const handleRequestReset = async () => {
        setLoading(true);
        try {
            await api.post('/auth/password_reset', { email });
            showToast('Password reset link sent to your email!', 'success');
            setTimeout(() => router.back(), 2000);
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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Logo size="large" darkMode={darkMode} />
                    <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="you@example.com"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleRequestReset}
                        disabled={loading || !email}
                        style={[styles.submitButton, { backgroundColor: colors.primary, opacity: (loading || !email) ? 0.6 : 1 }]}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={[styles.backToLogin, { color: colors.textSecondary }]}>
                            Back to Login
                        </Text>
                    </TouchableOpacity>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    inputContainer: {
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
    backToLogin: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 14,
    },
});
