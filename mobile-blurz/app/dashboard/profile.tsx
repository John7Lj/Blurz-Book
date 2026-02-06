import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import Logo from '@/components/Logo';
import DarkModeToggle from '@/components/DarkModeToggle';
import useDarkMode from '@/hooks/useDarkMode';
import api from '@/services/api';

export default function ProfileScreen() {
    const { user } = useAuth();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const colors = darkMode ? Colors.dark : Colors.light;

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const handlePasswordUpdate = async () => {
        if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            Alert.alert('Error', "New passwords don't match!");
            return;
        }

        if (passwordData.new_password.length < 8) {
            Alert.alert('Error', 'New password must be at least 8 characters long');
            return;
        }

        try {
            await api.post('/auth/change_password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            Alert.alert('Success', 'Password updated successfully!');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail?.message ||
                error.response?.data?.detail ||
                error.message ||
                'Error updating password';
            Alert.alert('Error', errorMsg);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Logo size="medium" darkMode={darkMode} />
                <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
            </View>

            <View style={styles.titleSection}>
                <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.profileHeader}>
                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>
                                {user?.username?.[0]?.toUpperCase() || '?'}
                            </Text>
                        </View>
                        <Text style={[styles.username, { color: colors.text }]}>{user?.username}</Text>
                        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
                    </View>

                    {/* Profile Details */}
                    <View style={[styles.infoSection, { borderTopColor: colors.border }]}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>First Name</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {user?.first_name || 'Not set'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Last Name</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {user?.last_name || 'Not set'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Member Since</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Role</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {user?.role || 'User'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Status</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {user?.is_verified ? 'Verified' : 'Pending'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Change Password Section */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
                    <View style={styles.passwordSection}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                            Current Password
                        </Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: darkMode ? '#374151' : '#F9FAFB',
                                color: colors.text,
                                borderColor: colors.border
                            }]}
                            secureTextEntry
                            value={passwordData.current_password}
                            onChangeText={(text) => setPasswordData({ ...passwordData, current_password: text })}
                            placeholder="Enter current password"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                            New Password
                        </Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: darkMode ? '#374151' : '#F9FAFB',
                                color: colors.text,
                                borderColor: colors.border
                            }]}
                            secureTextEntry
                            value={passwordData.new_password}
                            onChangeText={(text) => setPasswordData({ ...passwordData, new_password: text })}
                            placeholder="Enter new password"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                            Confirm New Password
                        </Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: darkMode ? '#374151' : '#F9FAFB',
                                color: colors.text,
                                borderColor: colors.border
                            }]}
                            secureTextEntry
                            value={passwordData.confirm_password}
                            onChangeText={(text) => setPasswordData({ ...passwordData, confirm_password: text })}
                            placeholder="Confirm new password"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={handlePasswordUpdate}
                        >
                            <Text style={styles.updateButtonText}>Update Password</Text>
                        </TouchableOpacity>
                    </View>
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
        paddingBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    card: {
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
    },
    infoSection: {
        marginBottom: 8,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    passwordSection: {
        gap: 12,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    input: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
    },
    updateButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 8,
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
