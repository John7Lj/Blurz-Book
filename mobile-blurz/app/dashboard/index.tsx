import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import useToast from '@/hooks/useToast';
import useDarkMode from '@/hooks/useDarkMode';
import Logo from '@/components/Logo';
import DarkModeToggle from '@/components/DarkModeToggle';
import api from '@/services/api';

export default function DashboardHome() {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [menuOpen, setMenuOpen] = React.useState(false);

    const colors = darkMode ? Colors.dark : Colors.light;

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            await logout();
            showToast('Logged out successfully', 'success');
            router.replace('/auth');
        } catch (error) {
            console.error('Logout error:', error);
            await logout();
            router.replace('/auth');
        }
    };

    const navItems = [
        { id: 'books', label: 'All Books', icon: 'book', route: '/dashboard/books' },
        { id: 'my-books', label: 'My Books', icon: 'person', route: '/dashboard/my-books' },
        { id: 'add-book', label: 'Add Book', icon: 'add-circle', route: '/dashboard/add-book' },
        { id: 'profile', label: 'Profile', icon: 'person-circle', route: '/dashboard/profile' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <Logo size="medium" darkMode={darkMode} />

                <View style={styles.headerActions}>
                    <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />

                    <TouchableOpacity
                        onPress={() => setMenuOpen(!menuOpen)}
                        style={[styles.menuButton, { backgroundColor: colors.hover }]}
                    >
                        <Ionicons name="menu" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                        Welcome, {user?.username}!
                    </Text>
                    <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                        Manage your book collection with ease
                    </Text>
                </View>

                {/* Quick Actions Grid */}
                <View style={styles.grid}>
                    <TouchableOpacity
                        onPress={() => router.push('/dashboard/books')}
                        style={[styles.gridCard, { backgroundColor: colors.card }]}
                    >
                        <Ionicons name="book" size={48} color={colors.primary} style={styles.gridIcon} />
                        <Text style={[styles.gridLabel, { color: colors.text }]}>All Books</Text>
                        <Text style={[styles.gridSubtext, { color: colors.textSecondary }]}>
                            Explore our collection
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/dashboard/my-books')}
                        style={[styles.gridCard, { backgroundColor: colors.card }]}
                    >
                        <Ionicons name="person" size={48} color={colors.secondary} style={styles.gridIcon} />
                        <Text style={[styles.gridLabel, { color: colors.text }]}>My Books</Text>
                        <Text style={[styles.gridSubtext, { color: colors.textSecondary }]}>
                            Your personal collection
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/dashboard/add-book')}
                        style={[styles.gridCard, { backgroundColor: colors.card }]}
                    >
                        <Ionicons name="add-circle" size={48} color={colors.success} style={styles.gridIcon} />
                        <Text style={[styles.gridLabel, { color: colors.text }]}>Add Book</Text>
                        <Text style={[styles.gridSubtext, { color: colors.textSecondary }]}>
                            Add to your collection
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Sidebar Overlay */}
            {menuOpen && (
                <>
                    <TouchableOpacity
                        style={styles.overlay}
                        onPress={() => setMenuOpen(false)}
                        activeOpacity={1}
                    />
                    <View style={[styles.sidebar, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
                        <View style={[styles.sidebarHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.sidebarTitle, { color: colors.text }]}>Menu</Text>
                            <TouchableOpacity
                                onPress={() => setMenuOpen(false)}
                                style={[styles.closeButton, { backgroundColor: colors.hover }]}
                            >
                                <Ionicons name="close" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sidebarContent}>
                            {navItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        setMenuOpen(false);
                                        router.push(item.route as any);
                                    }}
                                    style={[styles.sidebarItem, { backgroundColor: 'transparent' }]}
                                >
                                    <Ionicons name={item.icon as any} size={20} color={colors.text} />
                                    <Text style={[styles.sidebarItemText, { color: colors.text }]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                onPress={() => {
                                    setMenuOpen(false);
                                    handleLogout();
                                }}
                                style={[styles.sidebarItem, styles.logoutItem, { backgroundColor: colors.error }]}
                            >
                                <Ionicons name="log-out" size={20} color="#FFFFFF" />
                                <Text style={[styles.sidebarItemText, { color: '#FFFFFF' }]}>
                                    Logout
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
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
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    menuButton: {
        padding: 8,
        borderRadius: 8,
    },
    scrollContent: {
        padding: 16,
    },
    welcomeSection: {
        paddingVertical: 48,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        fontSize: 20,
        textAlign: 'center',
    },
    grid: {
        gap: 16,
        marginBottom: 24,
    },
    gridCard: {
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    gridIcon: {
        marginBottom: 16,
    },
    gridLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    gridSubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 256,
        borderRightWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    sidebarTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 8,
        borderRadius: 8,
    },
    sidebarContent: {
        padding: 16,
        gap: 8,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 12,
    },
    sidebarItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutItem: {
        marginTop: 8,
    },
});
