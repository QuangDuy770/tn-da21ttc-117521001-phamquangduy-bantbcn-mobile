import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import StackNavigator from './navigation/StackNavigator';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_51QNZ9yIie5Vz8dOvB8EPj2upZZEYYvEKvXO75g6TPMC6epZWnLTXOYByzF9kHJuMrBQ9bf80zJatmL8PcbWbadpX0073jkARwc"  // ✅ dùng key này!
      merchantIdentifier="merchant.com.khotk" // ✅ cho Apple Pay (iOS), có thể để mặc định nếu chưa dùng
    >
      <StackNavigator />
      <StatusBar style="auto" />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
