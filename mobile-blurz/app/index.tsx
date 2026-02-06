import { useEffect } from 'react';
import { router, Href } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

export default function Index() {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/dashboard/' as Href);
            } else {
                router.replace('/auth');
            }
        }
    }, [user, loading]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
    );
}
