import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import paymentService from '../../services/payment.service';

interface RechargeScreenProps {
  navigation: any;
}

const RechargeScreen: React.FC<RechargeScreenProps> = () => {
  const [amount, setAmount] = useState('');
  const [chapaLoading, setChapaLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  const parseAmount = () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return null;
    }
    return amountNum;
  };

  const handleChapaMobile = async () => {
    const amountNum = parseAmount();
    if (!amountNum) return;

    setChapaLoading(true);
    try {
      const response = await paymentService.initializeChapaMobile({
        amount: amountNum,
        currency: 'ETB',
        callback_url: 'https://example.com/payment/callback',
        return_url: 'https://example.com/payment/return',
      });

      console.log('Full Chapa Response:', JSON.stringify(response, null, 2));

      // Try multiple possible response structures
      const url =
        response?.data?.checkout_url ||
        response?.data?.data?.checkout_url ||
        response?.checkout_url ||
        response?.data?.mobile_url ||
        response?.mobile_url ||
        response?.url;

      if (url) {
        console.log('Opening Chapa URL:', url);
        const result = await WebBrowser.openBrowserAsync(url);
        console.log('Browser result:', result);
        
        // After browser closes, you might want to verify payment status
        // This is optional - you can add payment verification here
      } else {
        console.error('No URL found in response:', response);
        Alert.alert(
          'Error',
          'Payment URL not found in response. Response: ' + JSON.stringify(response),
        );
      }
    } catch (error: any) {
      console.error('Chapa error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      
      const errorMessage = 
        error?.response?.data?.message ||
        error?.message ||
        'Failed to start Chapa payment. Please check your connection and try again.';
      
      Alert.alert('Payment Error', errorMessage);
    } finally {
      setChapaLoading(false);
    }
  };

  const handleStripe = async () => {
    const amountNum = parseAmount();
    if (!amountNum) return;

    setStripeLoading(true);
    try {
      const response = await paymentService.initializeStripe({
        amount: amountNum,
        currency: 'ETB',
      });

      if (response?.url) {
        await WebBrowser.openBrowserAsync(response.url);
      } else {
        Alert.alert('Error', 'Stripe checkout URL not found');
      }
    } catch (error: any) {
      console.log(
        'Stripe error:',
        JSON.stringify(error?.response?.data || error, null, 2),
      );
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          JSON.stringify(
            error?.response?.data || error.message || 'Failed to start Stripe payment',
          ),
      );
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Recharge Wallet</Text>
        <Text style={styles.subtitle}>Enter the amount you want to add</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.currencyLabel}>ETB</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, chapaLoading && styles.buttonDisabled]}
          onPress={handleChapaMobile}
          disabled={chapaLoading || stripeLoading}
        >
          {chapaLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Pay with Chapa</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.stripeButton, stripeLoading && styles.buttonDisabled]}
          onPress={handleStripe}
          disabled={chapaLoading || stripeLoading}
        >
          {stripeLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.stripeButtonText}>Pay with Stripe</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 24,
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 24,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  stripeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stripeButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RechargeScreen;
