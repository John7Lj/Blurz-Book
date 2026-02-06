import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

const useToast = () => {
    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        Toast.show({
            type: type,
            text1: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
            text2: message,
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
        });
    }, []);

    return { showToast };
};

export default useToast;
