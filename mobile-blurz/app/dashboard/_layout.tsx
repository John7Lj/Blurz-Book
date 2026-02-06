import { Stack } from 'expo-router';

export default function DashboardLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="books" />
            <Stack.Screen name="my-books" />
            <Stack.Screen name="add-book" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="book/[id]" />
        </Stack>
    );
}
